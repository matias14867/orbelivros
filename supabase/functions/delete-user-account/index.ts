import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";

    // Client bound to the caller's JWT to identify who is making the request
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Admin client using service role for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if caller is deleting their own account or is an admin
    let isAdmin = false;

    if (user.id !== userId) {
      const { data: roles, error: rolesError } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("Error checking roles", rolesError);
        return new Response(JSON.stringify({ error: "Error checking permissions" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      isAdmin = !!roles?.some((r: any) => r.role === "admin");

      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Delete related data using admin client (bypasses RLS by design)
    const tables = ["favorites", "purchase_history", "contacts", "user_roles", "profiles", "site_settings"];

    for (const table of tables) {
      const { error } = await adminClient.from(table).delete().eq("user_id", userId).or("updated_by.eq." + userId);
      if (error && table !== "site_settings") {
        console.error(`Error deleting from ${table}`, error);
      }
    }

    // Finally delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting auth user", deleteError);
      return new Response(JSON.stringify({ error: "Error deleting user" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in delete-user-account function", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
