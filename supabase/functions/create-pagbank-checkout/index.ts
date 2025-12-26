import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const pagbankToken = Deno.env.get("PAGBANK_TOKEN");
    if (!pagbankToken) {
      throw new Error("PAGBANK_TOKEN is not set");
    }
    logStep("PagBank token verified", { tokenLength: pagbankToken.length });

    const { items, customerEmail, customerName }: CheckoutRequest = await req.json();
    logStep("Request parsed", { itemCount: items?.length, hasEmail: !!customerEmail });

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

    // Generate unique reference ID
    const referenceId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // PagBank Checkout API - Production
    const apiUrl = "https://api.pagseguro.com/checkouts";
    
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
      notification_urls: [],
      expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    logStep("Creating PagBank checkout", { referenceId, apiUrl });

    // Ensure token has Bearer prefix
    const authHeader = pagbankToken.startsWith("Bearer ") 
      ? pagbankToken 
      : `Bearer ${pagbankToken}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
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
