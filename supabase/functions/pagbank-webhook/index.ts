import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { 
  checkRateLimit, 
  getClientIP, 
  sanitizeString, 
  isValidUUID,
  logSecurityEvent 
} from "../_shared/security.ts";

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

  const clientIP = getClientIP(req);

  try {
    // Rate limiting: 50 webhook calls per minute per IP
    const rateLimit = checkRateLimit(`webhook:${clientIP}`, 50, 60000);
    if (!rateLimit.allowed) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", { ip: clientIP, endpoint: "pagbank-webhook" });
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    logStep("Webhook received", { ip: clientIP });

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
    
    logStep("Webhook payload received");

    // Validate and sanitize reference_id
    const referenceId = sanitizeString(body.reference_id || "", 100);
    if (!referenceId || !referenceId.startsWith("order_")) {
      logSecurityEvent("INVALID_REFERENCE_ID", { referenceId: body.reference_id, ip: clientIP });
      return new Response(JSON.stringify({ received: true, processed: false, reason: "invalid_reference" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const notificationType = body.notificationType || body.event || body.type;
    const charges = body.charges || [];

    logStep("Notification type", { notificationType, referenceId, chargesCount: charges.length });

    // Check if payment was successful
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

    // Validate user_id format
    const userId = pendingPurchase.user_id;
    if (!userId || !isValidUUID(userId)) {
      logSecurityEvent("INVALID_USER_ID", { userId, referenceId, ip: clientIP });
      return new Response(JSON.stringify({ received: true, processed: false, reason: "invalid_user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Skip if it's the anonymous placeholder
    if (userId === '00000000-0000-0000-0000-000000000000') {
      logStep("Anonymous purchase - skipping webhook processing (client-side will handle)");
      return new Response(JSON.stringify({ received: true, processed: false, reason: "anonymous_user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found pending purchase", { userId, itemsCount: pendingPurchase.items?.length });

    // Validate and sanitize items
    const items = pendingPurchase.items || [];
    const purchaseRecords = items.map((item: any) => ({
      user_id: userId,
      order_id: referenceId,
      product_handle: sanitizeString(item.handle || item.name?.toLowerCase().replace(/\s+/g, '-') || '', 255),
      product_title: sanitizeString(item.name || '', 255),
      product_image: sanitizeString(item.image || '', 500),
      product_price: Math.max(0, Math.min(parseFloat(item.price) || 0, 999999)),
      quantity: Math.max(1, Math.min(parseInt(item.quantity) || 1, 100)),
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
      logSecurityEvent("PURCHASE_RECORDED", { userId, referenceId, itemCount: purchaseRecords.length });
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
    logSecurityEvent("WEBHOOK_ERROR", { error: errorMessage, ip: clientIP });
    return new Response(
      JSON.stringify({ error: "Internal error" }), // Don't expose internal errors
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
