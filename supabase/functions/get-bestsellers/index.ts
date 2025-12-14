import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await adminClient
      .from("purchase_history")
      .select("product_handle, quantity");

    if (error) {
      console.error("Error fetching purchase history", error);
      return new Response(JSON.stringify({ error: "Error fetching data" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const salesMap = new Map<string, number>();

    (data || []).forEach((purchase: any) => {
      const current = salesMap.get(purchase.product_handle) || 0;
      salesMap.set(purchase.product_handle, current + (purchase.quantity || 0));
    });

    const bestsellers = Array.from(salesMap.entries())
      .map(([handle, total_sold]) => ({ handle, total_sold }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 50);

    return new Response(JSON.stringify(bestsellers), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in get-bestsellers function", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
