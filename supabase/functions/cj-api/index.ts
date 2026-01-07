import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_API_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

interface CJApiResponse {
  code: number;
  result: boolean;
  message: string;
  data: unknown;
  requestId: string;
}

async function getAccessToken(): Promise<string> {
  const apiKey = Deno.env.get("CJ_API_KEY");
  const email = Deno.env.get("CJ_EMAIL");
  
  if (!apiKey || !email) {
    throw new Error("CJ API credentials not configured");
  }

  const response = await fetch(`${CJ_API_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: apiKey }),
  });

  const data: CJApiResponse = await response.json();
  
  if (!data.result) {
    throw new Error(`CJ Auth failed: ${data.message}`);
  }

  return data.data as string;
}

async function cjRequest(endpoint: string, method: string = "GET", body?: unknown): Promise<CJApiResponse> {
  const accessToken = await getAccessToken();
  
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": accessToken,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${CJ_API_BASE}${endpoint}`, options);
  return response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, ...params } = await req.json();

    let result: unknown;

    switch (action) {
      case "getCategories": {
        const response = await cjRequest("/product/getCategory");
        result = response.data;
        break;
      }

      case "searchProducts": {
        const { categoryId, keyword, pageNum = 1, pageSize = 20 } = params;
        const body: Record<string, unknown> = { pageNum, pageSize };
        if (categoryId) body.categoryId = categoryId;
        if (keyword) body.productNameEn = keyword;
        
        const response = await cjRequest("/product/list", "POST", body);
        result = response.data;
        break;
      }

      case "syncBooks": {
        // Sync books with limited API calls
        const { pageNum = 1, pageSize = 10, markup = 2.5 } = params;
        
        // Search for books - single API call
        const searchBody = { 
          pageNum, 
          pageSize,
          productNameEn: "book",
        };
        
        const searchResponse = await cjRequest("/product/list", "POST", searchBody);
        
        if (!searchResponse.result) {
          throw new Error(`Search failed: ${searchResponse.message}`);
        }

        const products = searchResponse.data as { list?: unknown[] } | null;
        const productList = products?.list || [];
        
        if (productList.length === 0) {
          result = { imported: 0, message: "No products found" };
          break;
        }

        let imported = 0;
        const errors: string[] = [];

        // Process each product without additional API calls for variants
        for (const product of productList as Array<{
          pid: string;
          productNameEn: string;
          description?: string;
          categoryName?: string;
          sellPrice?: string;
          productWeight?: string;
          productImage?: string;
          productImageSet?: string[];
          productSku?: string;
          categoryId?: string;
        }>) {
          try {
            const handle = product.productNameEn
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

            const costPrice = parseFloat(product.sellPrice || product.productWeight || "0");
            const price = Math.ceil(costPrice * markup * 5.5);
            const compareAtPrice = Math.ceil(price * 1.3);

            const { error } = await supabaseClient.from("products").upsert({
              cj_product_id: product.pid,
              cj_variant_id: null, // Skip variant API call to save quota
              title: product.productNameEn,
              description: product.description || product.productNameEn,
              category: product.categoryName || "Livros",
              handle: `${handle}-${product.pid.substring(0, 8)}`,
              price: price > 0 ? price : 49.90,
              compare_at_price: compareAtPrice > 0 ? compareAtPrice : 69.90,
              cost_price: costPrice,
              currency: "BRL",
              image_url: product.productImage,
              images: product.productImageSet || [product.productImage],
              sku: product.productSku,
              in_stock: true,
              stock_quantity: 999,
              weight: parseFloat(product.productWeight || "0"),
              cj_category_id: product.categoryId,
              supplier_name: "CJ Dropshipping",
              shipping_time: "15-30 dias úteis",
            }, { onConflict: "cj_product_id" });

            if (error) {
              errors.push(`${product.productNameEn}: ${error.message}`);
            } else {
              imported++;
            }
          } catch (e) {
            const errMsg = e instanceof Error ? e.message : "Unknown error";
            errors.push(`${product.productNameEn}: ${errMsg}`);
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
        const response = await cjRequest(`/product/query?pid=${pid}`);
        result = response.data;
        break;
      }

      case "getVariants": {
        const { pid } = params;
        const response = await cjRequest(`/product/variant/query?pid=${pid}`);
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
          const variantsResponse = await cjRequest(`/product/variant/query?pid=${product.pid}`);
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

        const response = await cjRequest("/shopping/order/createOrderV2", "POST", {
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
          payType: 3, // No balance payment
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
        const response = await cjRequest(`/shopping/order/getOrderDetail?orderId=${orderId}`);
        result = response.data;
        break;
      }

      case "getShippingMethods": {
        const { startCountryCode = "CN", endCountryCode, productWeight } = params;
        const response = await cjRequest("/logistic/freightCalculate", "POST", {
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
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});