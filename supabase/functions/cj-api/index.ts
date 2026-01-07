import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

// Token cache (DB + memory) to avoid CJ auth rate limit (1 request / 300s)
const TOKEN_CACHE_KEY = "cj_access_token";
const TOKEN_VALIDITY_SECONDS = 86400; // we assume 24h; adjust later if CJ docs differ
const TOKEN_REFRESH_BUFFER = 3600; // refresh 1h before expiry
const AUTH_COOLDOWN_SECONDS = 300; // CJ: 1 auth request / 300 seconds

let inMemoryToken: { token: string; expiresAtMs: number } | null = null;
let inFlightTokenPromise: Promise<string> | null = null;

interface CJApiResponse {
  code: number;
  result: boolean;
  message: string;
  data: unknown;
  requestId: string;
}

interface TokenCacheValue {
  token?: unknown;
  expires_at?: string;
  last_auth_attempt_at?: string;
  last_auth_error_at?: string;
  last_auth_error?: string;
}

function extractAccessToken(token: unknown): string | null {
  if (!token) return null;
  if (typeof token === "string") return token;
  if (typeof token === "object") {
    const t = token as Record<string, unknown>;
    if (typeof t.accessToken === "string") return t.accessToken;
    if (typeof t.token === "string") return t.token;
  }
  return null;
}

async function getAccessToken(supabaseClient: SupabaseClient): Promise<string> {
  // 1) Fast path: in-memory cache (best effort)
  if (inMemoryToken && inMemoryToken.expiresAtMs - Date.now() > TOKEN_REFRESH_BUFFER * 1000) {
    return inMemoryToken.token;
  }

  // 2) De-dup concurrent requests in the same runtime
  if (inFlightTokenPromise) return inFlightTokenPromise;

  inFlightTokenPromise = (async () => {
    // 3) DB cache (persists across invocations)
    const { data: cachedRow, error: cachedError } = await supabaseClient
      .from("site_settings")
      .select("value")
      .eq("key", TOKEN_CACHE_KEY)
      .maybeSingle();

    if (cachedError) {
      console.warn("Failed to read CJ token cache:", cachedError.message);
    }

    const cached = (cachedRow?.value as TokenCacheValue | null) ?? null;
    const cachedToken = extractAccessToken(cached?.token);

    if (cachedToken && cached?.expires_at) {
      const expiresAtMs = new Date(cached.expires_at).getTime();
      if (expiresAtMs - Date.now() > TOKEN_REFRESH_BUFFER * 1000) {
        inMemoryToken = { token: cachedToken, expiresAtMs };
        return cachedToken;
      }
    }

    // 4) Cooldown guard: avoid hammering CJ auth endpoint
    if (cached?.last_auth_attempt_at) {
      const lastAttemptMs = new Date(cached.last_auth_attempt_at).getTime();
      const remainingMs = AUTH_COOLDOWN_SECONDS * 1000 - (Date.now() - lastAttemptMs);
      if (remainingMs > 0) {
        const fallbackToken = extractAccessToken(cached?.token);
        if (fallbackToken) {
          console.warn("CJ auth cooldown active; using existing cached token as fallback");
          inMemoryToken = {
            token: fallbackToken,
            expiresAtMs: cached?.expires_at ? new Date(cached.expires_at).getTime() : Date.now() + 5 * 60 * 1000,
          };
          return fallbackToken;
        }

        const waitSec = Math.ceil(remainingMs / 1000);
        throw new Error(`CJ em cooldown (${waitSec}s). Aguarde e tente novamente.`);
      }
    }

    // 5) Fetch new token
    const apiKey = Deno.env.get("CJ_API_KEY");
    const email = Deno.env.get("CJ_EMAIL");

    if (!apiKey || !email) {
      throw new Error("CJ API credentials not configured");
    }

    const nowIso = new Date().toISOString();

    // Record attempt (so repeated clicks won't waste quota)
    await supabaseClient
      .from("site_settings")
      .upsert(
        {
          key: TOKEN_CACHE_KEY,
          value: { ...(cached ?? {}), last_auth_attempt_at: nowIso },
          updated_at: nowIso,
        },
        { onConflict: "key" }
      );

    console.log("Fetching new CJ access token...");
    const response = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: apiKey }),
    });

    const data: CJApiResponse = await response.json();

    if (!data.result) {
      // Persist error info to help diagnose + enforce cooldown
      await supabaseClient.from("site_settings").upsert(
        {
          key: TOKEN_CACHE_KEY,
          value: {
            ...(cached ?? {}),
            last_auth_attempt_at: nowIso,
            last_auth_error_at: nowIso,
            last_auth_error: data.message,
          },
          updated_at: nowIso,
        },
        { onConflict: "key" }
      );

      const msg = data.message || "Authentication failed";
      if (msg.toLowerCase().includes("too many requests") || msg.toLowerCase().includes("qps")) {
        throw new Error(`CJ em cooldown (${AUTH_COOLDOWN_SECONDS}s). Aguarde e tente novamente.`);
      }

      throw new Error(`CJ Auth failed: ${msg}`);
    }

    const extractedToken = extractAccessToken(data.data);
    if (!extractedToken) {
      throw new Error("CJ Auth returned unexpected token format");
    }

    const newToken = extractedToken;
    const expiresAtMs = Date.now() + TOKEN_VALIDITY_SECONDS * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();

    await supabaseClient.from("site_settings").upsert(
      {
        key: TOKEN_CACHE_KEY,
        value: {
          token: newToken,
          expires_at: expiresAtIso,
          last_auth_attempt_at: nowIso,
        },
        updated_at: nowIso,
      },
      { onConflict: "key" }
    );

    inMemoryToken = { token: newToken, expiresAtMs };
    console.log("New CJ token cached, expires at:", expiresAtIso);
    return newToken;
  })();

  try {
    return await inFlightTokenPromise;
  } finally {
    inFlightTokenPromise = null;
  }
}

async function cjRequest(
  supabaseClient: SupabaseClient,
  endpoint: string,
  method: string = "GET",
  bodyOrParams?: unknown
): Promise<CJApiResponse> {
  const accessToken = await getAccessToken(supabaseClient);

  let url = `${CJ_API_BASE}${endpoint}`;

  // For GET requests, append query params; for others, use JSON body
  if (method === "GET" && bodyOrParams && typeof bodyOrParams === "object") {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(bodyOrParams as Record<string, unknown>)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
    },
  };

  if (method !== "GET" && bodyOrParams) {
    options.body = JSON.stringify(bodyOrParams);
  }

  const response = await fetch(url, options);
  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Backend credentials not configured (missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY)");
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey);

    const { action, ...params } = await req.json();

    let result: unknown;

    switch (action) {
      case "getCategories": {
        const response = await cjRequest(supabaseClient, "/product/getCategory");
        result = response.data;
        break;
      }

      case "searchProducts": {
        const { categoryId, keyword, page = 1, size = 20 } = params;
        const queryParams: Record<string, unknown> = { page, size };
        if (categoryId) queryParams.categoryId = categoryId;
        if (keyword) queryParams.keyWord = keyword;

        const response = await cjRequest(supabaseClient, "/product/listV2", "GET", queryParams);
        result = response.data;
        break;
      }

      case "syncBooks": {
        // Sync books with limited API calls using GET /product/listV2
        const { page = 1, size = 10, markup = 2.5 } = params;

        const queryParams = {
          page,
          size,
          keyWord: "book",
        };

        const searchResponse = await cjRequest(supabaseClient, "/product/listV2", "GET", queryParams);

        if (!searchResponse.result) {
          throw new Error(`Search failed: ${searchResponse.message}`);
        }

        // listV2 returns { content: [{ productList: [...] }] }
        const responseData = searchResponse.data as {
          content?: Array<{ productList?: unknown[] }>;
        } | null;
        const productList = responseData?.content?.[0]?.productList || [];
        
        if (productList.length === 0) {
          result = { imported: 0, message: "No products found" };
          break;
        }

        let imported = 0;
        const errors: string[] = [];

        // Process each product (listV2 field names differ from old API)
        for (const product of productList as Array<{
          id: string;
          nameEn: string;
          description?: string;
          threeCategoryName?: string;
          sellPrice?: string;
          bigImage?: string;
          sku?: string;
          categoryId?: string;
        }>) {
          try {
            const titleRaw = product.nameEn || "Produto CJ";
            const handle = titleRaw
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

            const costPrice = parseFloat(product.sellPrice || "0");
            const price = Math.ceil(costPrice * markup * 5.5);
            const compareAtPrice = Math.ceil(price * 1.3);

            const { error } = await supabaseClient.from("products").upsert({
              cj_product_id: product.id,
              cj_variant_id: null,
              title: titleRaw,
              description: product.description || titleRaw,
              category: product.threeCategoryName || "Livros",
              handle: `${handle}-${product.id.substring(0, 8)}`,
              price: price > 0 ? price : 49.90,
              compare_at_price: compareAtPrice > 0 ? compareAtPrice : 69.90,
              cost_price: costPrice,
              currency: "BRL",
              image_url: product.bigImage,
              images: product.bigImage ? [product.bigImage] : [],
              sku: product.sku,
              in_stock: true,
              stock_quantity: 999,
              weight: 0,
              cj_category_id: product.categoryId,
              supplier_name: "CJ Dropshipping",
              shipping_time: "15-30 dias úteis",
            }, { onConflict: "cj_product_id" });

            if (error) {
              errors.push(`${titleRaw}: ${error.message}`);
            } else {
              imported++;
            }
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : "Unknown error";
            errors.push(`${product.nameEn || product.id}: ${errMsg}`);
          }
        }

        // Log sync
        await supabaseClient.from("cj_sync_log").insert({
          sync_type: "books",
          status: errors.length > 0 ? "partial" : "completed",
          products_synced: imported,
          errors: errors.length > 0 ? errors : null,
          completed_at: new Date().toISOString(),
        });

        result = { 
          imported, 
          total: productList.length,
          errors: errors.length > 0 ? errors : undefined,
          message: `Imported ${imported} of ${productList.length} products`
        };
        break;
      }

      case "getProductDetails": {
        const { pid } = params;
        const response = await cjRequest(supabaseClient, `/product/query?pid=${pid}`);
        result = response.data;
        break;
      }

      case "getVariants": {
        const { pid } = params;
        const response = await cjRequest(supabaseClient, `/product/variant/query?pid=${pid}`);
        result = response.data;
        break;
      }

      case "importProduct": {
        const { product, markup = 2.5 } = params;
        
        // Generate handle from title
        const handle = product.productNameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Calculate prices (CJ prices are in USD, we'll convert and add markup)
        const costPrice = parseFloat(product.sellPrice || product.productWeight || 0);
        const price = Math.ceil(costPrice * markup * 5.5); // Convert USD to BRL with markup
        const compareAtPrice = Math.ceil(price * 1.3); // Fake "original" price

        // Get first variant ID
        let cjVariantId = null;
        try {
          const variantsResponse = await cjRequest(supabaseClient, `/product/variant/query?pid=${product.pid}`);
          if (variantsResponse.result && Array.isArray(variantsResponse.data) && variantsResponse.data.length > 0) {
            cjVariantId = variantsResponse.data[0].vid;
          }
        } catch (e) {
          console.error("Failed to get variants:", e);
        }

        const { error } = await supabaseClient.from("products").upsert({
          cj_product_id: product.pid,
          cj_variant_id: cjVariantId,
          title: product.productNameEn,
          description: product.description || product.productNameEn,
          category: product.categoryName || "Geral",
          handle: `${handle}-${product.pid.substring(0, 8)}`,
          price,
          compare_at_price: compareAtPrice,
          cost_price: costPrice,
          currency: "BRL",
          image_url: product.productImage,
          images: product.productImageSet || [product.productImage],
          sku: product.productSku,
          in_stock: true,
          stock_quantity: 999,
          weight: parseFloat(product.productWeight || 0),
          cj_category_id: product.categoryId,
          supplier_name: "CJ Dropshipping",
          shipping_time: "15-30 dias úteis",
        }, { onConflict: "cj_product_id" });

        if (error) throw error;
        result = { success: true, handle };
        break;
      }

      case "createOrder": {
        const { order, items } = params;
        
        const products = items.map((item: { cj_variant_id: string; quantity: number }) => ({
          vid: item.cj_variant_id,
          quantity: item.quantity,
        }));

        const response = await cjRequest(supabaseClient, "/shopping/order/createOrderV2", "POST", {
          orderNumber: order.order_number,
          shippingZip: order.shipping_zip,
          shippingCountryCode: order.shipping_country_code,
          shippingCountry: order.shipping_country,
          shippingProvince: order.shipping_state,
          shippingCity: order.shipping_city,
          shippingAddress: order.shipping_address,
          shippingAddress2: order.shipping_address2 || "",
          shippingCustomerName: order.shipping_name,
          shippingPhone: order.shipping_phone,
          email: order.shipping_email || "",
          remark: `Order from dropshipping store`,
          fromCountryCode: "CN",
          logisticName: "CJPacket Ordinary",
          payType: 3,
          platform: "other",
          products,
        });

        if (!response.result) {
          throw new Error(`CJ Order failed: ${response.message}`);
        }

        // Update order with CJ order ID
        const responseData = response.data as { orderId?: string } | null;
        await supabaseClient.from("orders").update({
          cj_order_id: responseData?.orderId || null,
          status: "processing",
        }).eq("id", order.id);

        result = response.data;
        break;
      }

      case "getOrderStatus": {
        const { orderId } = params;
        const response = await cjRequest(supabaseClient, `/shopping/order/getOrderDetail?orderId=${orderId}`);
        result = response.data;
        break;
      }

      case "getShippingMethods": {
        const { startCountryCode = "CN", endCountryCode, productWeight } = params;
        const response = await cjRequest(supabaseClient, "/logistic/freightCalculate", "POST", {
          startCountryCode,
          endCountryCode,
          productWeight,
        });
        result = response.data;
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("CJ API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    const status = errorMessage.startsWith("CJ em cooldown") ? 429 : 500;

    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});