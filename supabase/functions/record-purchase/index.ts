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

interface RecordPurchaseRequest {
  referenceId: string;
  items: CartItem[];
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RECORD-PURCHASE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const { referenceId, items }: RecordPurchaseRequest = await req.json();
    logStep("Request parsed", { referenceId, itemCount: items?.length });

    if (!referenceId || !items || items.length === 0) {
      throw new Error("Missing referenceId or items");
    }

    // Check if this order was already recorded
    const { data: existingOrder } = await supabaseClient
      .from('purchase_history')
      .select('id')
      .eq('order_id', referenceId)
      .eq('user_id', userId)
      .limit(1);

    if (existingOrder && existingOrder.length > 0) {
      logStep("Order already recorded", { referenceId });
      return new Response(
        JSON.stringify({ success: true, message: "Order already recorded" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Insert purchase records
    const purchaseRecords = items.map((item) => ({
      user_id: userId,
      order_id: referenceId,
      product_handle: item.handle || item.name.toLowerCase().replace(/\s+/g, '-'),
      product_title: item.name,
      product_image: item.image || null,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabaseClient
      .from('purchase_history')
      .insert(purchaseRecords);

    if (insertError) {
      logStep("Error inserting purchase history", { error: insertError });
      throw insertError;
    }

    logStep("Purchase history saved successfully", { recordsCount: purchaseRecords.length });

    // Clean up any pending purchase with this reference
    await supabaseClient
      .from('pending_purchases')
      .delete()
      .eq('reference_id', referenceId);

    return new Response(
      JSON.stringify({ success: true, recordsCount: purchaseRecords.length }),
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
