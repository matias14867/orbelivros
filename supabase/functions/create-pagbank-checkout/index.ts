import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { 
  checkRateLimit, 
  getClientIP, 
  sanitizeString, 
  isValidPrice,
  isValidQuantity,
  logSecurityEvent 
} from "../_shared/security.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  handle?: string;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail?: string;
  customerName?: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAGBANK-CHECKOUT] ${step}${detailsStr}`);
};

// Validate and sanitize cart items
function validateAndSanitizeItems(items: any[]): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Invalid items array");
  }

  if (items.length > 50) {
    throw new Error("Too many items in cart");
  }

  return items.map((item, index) => {
    const name = sanitizeString(item.name || '', 64);
    const price = parseFloat(item.price);
    const quantity = parseInt(item.quantity);

    if (!name || name.length < 2) {
      throw new Error(`Item ${index + 1} has invalid name`);
    }

    if (!isValidPrice(price)) {
      throw new Error(`Item ${index + 1} has invalid price`);
    }

    if (!isValidQuantity(quantity)) {
      throw new Error(`Item ${index + 1} has invalid quantity`);
    }

    return {
      name,
      price,
      quantity,
      image: sanitizeString(item.image || '', 500),
      handle: sanitizeString(item.handle || '', 255),
    };
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIP = getClientIP(req);

  try {
    // Rate limiting: 20 checkout attempts per minute per IP
    const rateLimit = checkRateLimit(`checkout:${clientIP}`, 20, 60000);
    if (!rateLimit.allowed) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { ip: clientIP, endpoint: "create-pagbank-checkout" });
      return new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde um momento." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    logStep("Function started", { ip: clientIP });

    let pagbankToken = Deno.env.get("PAGBANK_TOKEN");
    if (!pagbankToken) {
      throw new Error("PAGBANK_TOKEN is not set");
    }
    // Remove any whitespace from token
    pagbankToken = pagbankToken.trim();
    logStep("PagBank token verified");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Try to get authenticated user (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      userId = userData.user?.id || null;
      logStep("User authenticated", { userId });
    }

    // Parse and validate request body
    let requestBody: CheckoutRequest;
    try {
      requestBody = await req.json();
    } catch {
      throw new Error("Invalid JSON body");
    }

    const { items: rawItems, customerEmail, customerName } = requestBody;
    
    // Validate and sanitize items
    const items = validateAndSanitizeItems(rawItems);
    logStep("Request validated", { itemCount: items.length, userId });

    // Calculate total for logging/validation
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalAmount > 100000) { // Max R$ 100,000
      logSecurityEvent("HIGH_VALUE_ORDER", { totalAmount, userId, ip: clientIP });
    }

    // Create items array for PagBank (amount in centavos)
    const pagbankItems = items.map((item, index) => ({
      reference_id: `item_${index + 1}`,
      name: item.name.substring(0, 64),
      quantity: item.quantity,
      unit_amount: Math.round(item.price * 100),
    }));

    logStep("Items prepared", { count: pagbankItems.length });

    // Get origin for redirect URLs - validate it's from allowed domains
    const origin = req.headers.get("origin") || "";
    const allowedOrigins = [
      "https://localhost",
      "http://localhost",
      "https://orbelivros.com.br",
      "https://www.orbelivros.com.br",
      "https://preview--",
      "https://id-preview--",
    ];
    
    const isAllowedOrigin = allowedOrigins.some(allowed => origin.startsWith(allowed));
    const safeOrigin = isAllowedOrigin ? origin : "https://orbelivros.com.br";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Generate unique reference ID with timestamp for uniqueness
    const referenceId = `order_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;

    // Store pending purchase for webhook processing
    const { error: pendingError } = await supabaseClient
      .from('pending_purchases')
      .insert({
        reference_id: referenceId,
        user_id: userId || '00000000-0000-0000-0000-000000000000',
        items: items,
        created_at: new Date().toISOString(),
      });

    if (pendingError) {
      logStep("Warning: Could not store pending purchase", { error: pendingError });
    } else {
      logStep("Pending purchase stored", { referenceId, userId: userId || 'anonymous' });
    }

    // PagBank Checkout API - Production
    const apiUrl = "https://api.pagseguro.com/checkouts";
    
    // Webhook URL for payment notifications
    const webhookUrl = `${supabaseUrl}/functions/v1/pagbank-webhook`;
    
    const checkoutPayload = {
      reference_id: referenceId,
      customer_modifiable: true,
      items: pagbankItems,
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "DEBIT_CARD" },
        { type: "BOLETO" },
        { type: "PIX" },
      ],
      payment_methods_configs: [
        {
          type: "CREDIT_CARD",
          config_options: [
            { option: "INSTALLMENTS_LIMIT", value: "12" },
          ],
        },
      ],
      soft_descriptor: "Aconchego",
      redirect_url: `${safeOrigin}/payment-success?reference_id=${referenceId}`,
      payment_notification_urls: [webhookUrl],
      notification_urls: [],
    };

    // Ensure token has Bearer prefix
    const authHeaderPagbank = pagbankToken.startsWith("Bearer ") 
      ? pagbankToken 
      : `Bearer ${pagbankToken}`;

    logStep("Creating PagBank checkout", { referenceId, webhookUrl });

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeaderPagbank,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(checkoutPayload),
    });

    const responseText = await response.text();
    logStep("PagBank response status", { status: response.status });

    if (!response.ok) {
      logStep("PagBank error response", { body: responseText });
      logSecurityEvent("PAGBANK_ERROR", { status: response.status, referenceId, ip: clientIP });
      throw new Error(`Erro ao criar checkout: ${response.status}`);
    }

    const checkoutData = JSON.parse(responseText);
    logStep("Checkout created successfully", { checkoutId: checkoutData.id });

    // Find the payment link from the response
    const paymentLink = checkoutData.links?.find(
      (link: { rel: string; href: string }) => link.rel === "PAY"
    );

    if (!paymentLink) {
      throw new Error("Payment link not found in PagBank response");
    }

    logSecurityEvent("CHECKOUT_CREATED", { referenceId, userId, ip: clientIP });

    return new Response(
      JSON.stringify({ 
        url: paymentLink.href,
        checkoutId: checkoutData.id,
        referenceId: referenceId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    logSecurityEvent("CHECKOUT_ERROR", { error: errorMessage, ip: clientIP });
    
    // Return user-friendly error message
    const userMessage = errorMessage.includes("Invalid") || errorMessage.includes("invalid")
      ? errorMessage
      : "Erro ao processar checkout. Tente novamente.";
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
