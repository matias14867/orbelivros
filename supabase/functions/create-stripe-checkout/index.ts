import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail?: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-CHECKOUT] ${step}${detailsStr}`);
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
    const rateLimit = checkRateLimit(`stripe:${clientIP}`, 20, 60000);
    if (!rateLimit.allowed) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { ip: clientIP, endpoint: "create-stripe-checkout" });
      return new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde um momento." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    logStep("Function started", { ip: clientIP });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    // Parse and validate request body
    let requestBody: CheckoutRequest;
    try {
      requestBody = await req.json();
    } catch {
      throw new Error("Invalid JSON body");
    }

    const { items: rawItems, customerEmail } = requestBody;
    
    // Validate and sanitize items
    const items = validateAndSanitizeItems(rawItems);
    logStep("Request validated", { itemCount: items.length });

    // Calculate total for logging/validation
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (totalAmount > 100000) { // Max R$ 100,000
      logSecurityEvent("HIGH_VALUE_ORDER", { totalAmount, ip: clientIP });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to centavos
      },
      quantity: item.quantity,
    }));

    logStep("Line items created", { count: lineItems.length });

    // Get origin for success/cancel URLs - validate it's from allowed domains
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

    // Validate customer email if provided
    const safeEmail = customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) 
      ? customerEmail 
      : undefined;

    // Create checkout session with PIX and card payment methods explicitly enabled
    const session = await stripe.checkout.sessions.create({
      customer_email: safeEmail,
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["card", "pix", "boleto"],
      success_url: `${safeOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${safeOrigin}/payment-canceled`,
      locale: "pt-BR",
      payment_method_options: {
        pix: {
          expires_after_seconds: 86400, // 24 hours
        },
        boleto: {
          expires_after_days: 3,
        },
      },
      metadata: {
        source: "orbelivros_store",
      },
    });

    logStep("Checkout session created", { sessionId: session.id });
    logSecurityEvent("STRIPE_CHECKOUT_CREATED", { sessionId: session.id, ip: clientIP });

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    logSecurityEvent("STRIPE_CHECKOUT_ERROR", { error: errorMessage, ip: clientIP });
    
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
