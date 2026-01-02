import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    let pagbankToken = Deno.env.get("PAGBANK_TOKEN");
    if (!pagbankToken) {
      throw new Error("PAGBANK_TOKEN is not set");
    }
    // Remove any whitespace from token
    pagbankToken = pagbankToken.trim();
    logStep("PagBank token verified", { tokenLength: pagbankToken.length });

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

    const { items, customerEmail, customerName }: CheckoutRequest = await req.json();
    logStep("Request parsed", { itemCount: items?.length, hasEmail: !!customerEmail, userId });

    if (!items || items.length === 0) {
      throw new Error("No items provided for checkout");
    }

    // Create items array for PagBank (amount in centavos)
    const pagbankItems = items.map((item, index) => ({
      reference_id: `item_${index + 1}`,
      name: item.name.substring(0, 64), // PagBank limit
      quantity: item.quantity,
      unit_amount: Math.round(item.price * 100), // Convert to centavos
    }));

    logStep("Items prepared", { count: pagbankItems.length });

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://localhost:5173";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Generate unique reference ID
    const referenceId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store pending purchase for webhook processing
    if (userId) {
      const { error: pendingError } = await supabaseClient
        .from('pending_purchases')
        .insert({
          reference_id: referenceId,
          user_id: userId,
          items: items,
          created_at: new Date().toISOString(),
        });

      if (pendingError) {
        logStep("Warning: Could not store pending purchase", { error: pendingError });
      } else {
        logStep("Pending purchase stored", { referenceId, userId });
      }
    }

    // PagBank Checkout API - Production
    const apiUrl = "https://api.pagseguro.com/checkouts";
    
    // Webhook URL for payment notifications
    const webhookUrl = `${supabaseUrl}/functions/v1/pagbank-webhook`;
    
    const checkoutPayload = {
      reference_id: referenceId,
      customer: customerEmail ? {
        email: customerEmail,
        name: customerName || "Cliente",
      } : undefined,
      items: pagbankItems,
      payment_methods: [
        { type: "PIX" },
        { type: "BOLETO" },
        { type: "CREDIT_CARD" },
        { type: "DEBIT_CARD" },
      ],
      payment_methods_configs: [
        {
          type: "CREDIT_CARD",
          config_options: [
            { option: "INSTALLMENTS_LIMIT", value: "12" },
          ],
        },
      ],
      redirect_urls: {
        return_url: `${origin}/payment-success?reference_id=${referenceId}`,
      },
      notification_urls: [webhookUrl],
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    // Ensure token has Bearer prefix
    const authHeaderPagbank = pagbankToken.startsWith("Bearer ") 
      ? pagbankToken 
      : `Bearer ${pagbankToken}`;

    logStep("Creating PagBank checkout", { 
      referenceId, 
      apiUrl, 
      webhookUrl,
      tokenPreview: `${pagbankToken.substring(0, 10)}...${pagbankToken.substring(pagbankToken.length - 10)}`,
      authHeaderPreview: `${authHeaderPagbank.substring(0, 17)}...`,
    });
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
      throw new Error(`PagBank API error: ${response.status} - ${responseText}`);
    }

    const checkoutData = JSON.parse(responseText);
    logStep("Checkout created successfully", { 
      checkoutId: checkoutData.id,
      links: checkoutData.links 
    });

    // Find the payment link from the response
    const paymentLink = checkoutData.links?.find(
      (link: { rel: string; href: string }) => link.rel === "PAY"
    );

    if (!paymentLink) {
      throw new Error("Payment link not found in PagBank response");
    }

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
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
