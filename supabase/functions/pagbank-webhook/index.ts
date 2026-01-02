import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAGBANK-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // PagBank sometimes sends non-JSON notifications (like URL-encoded form data)
    const contentType = req.headers.get("content-type") || "";
    let body: any;
    
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Try to parse as JSON anyway, if fails, try form data
      const text = await req.text();
      try {
        body = JSON.parse(text);
      } catch {
        // If it's form-encoded or other format, parse it
        if (contentType.includes("application/x-www-form-urlencoded") || text.includes("=")) {
          const params = new URLSearchParams(text);
          body = Object.fromEntries(params.entries());
          // Try to parse notificationCode for older PagBank format
          if (body.notificationCode) {
            logStep("Legacy notification received", { notificationCode: body.notificationCode });
            // Legacy notifications require fetching order details from PagBank API
            // For now, acknowledge receipt
            return new Response(JSON.stringify({ received: true, legacy: true }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        } else {
          logStep("Unknown content format", { contentType, textPreview: text.substring(0, 100) });
          return new Response(JSON.stringify({ received: true, unknown_format: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
    }
    
    logStep("Webhook payload", body);

    // PagBank sends different notification types
    // We're interested in CHECKOUT.PAID or similar payment confirmation events
    const notificationType = body.notificationType || body.event || body.type;
    const charges = body.charges || [];
    const referenceId = body.reference_id;

    logStep("Notification type", { notificationType, referenceId, chargesCount: charges.length });

    // Check if payment was successful
    // PagBank sends status PAID when payment is confirmed
    const isPaid = charges.some((charge: any) => 
      charge.status === "PAID" || charge.status === "AUTHORIZED"
    ) || body.status === "PAID";

    if (!isPaid) {
      logStep("Payment not confirmed yet", { status: body.status });
      return new Response(JSON.stringify({ received: true, processed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Payment confirmed, processing purchase history");

    // Look for pending purchase in our temp storage
    const { data: pendingPurchase, error: fetchError } = await supabaseClient
      .from('pending_purchases')
      .select('*')
      .eq('reference_id', referenceId)
      .single();

    if (fetchError || !pendingPurchase) {
      logStep("No pending purchase found for reference", { referenceId, error: fetchError });
      return new Response(JSON.stringify({ received: true, processed: false, reason: "no_pending_purchase" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found pending purchase", { userId: pendingPurchase.user_id, itemsCount: pendingPurchase.items?.length });

    // Insert each item into purchase history
    const items = pendingPurchase.items || [];
    const purchaseRecords = items.map((item: any) => ({
      user_id: pendingPurchase.user_id,
      order_id: referenceId,
      product_handle: item.handle || item.name.toLowerCase().replace(/\s+/g, '-'),
      product_title: item.name,
      product_image: item.image || null,
      product_price: item.price,
      quantity: item.quantity,
    }));

    if (purchaseRecords.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('purchase_history')
        .insert(purchaseRecords);

      if (insertError) {
        logStep("Error inserting purchase history", { error: insertError });
        throw insertError;
      }

      logStep("Purchase history saved successfully", { recordsCount: purchaseRecords.length });
    }

    // Clean up pending purchase
    await supabaseClient
      .from('pending_purchases')
      .delete()
      .eq('reference_id', referenceId);

    logStep("Pending purchase cleaned up");

    return new Response(JSON.stringify({ received: true, processed: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
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
