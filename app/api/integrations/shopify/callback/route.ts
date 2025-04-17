import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Estas variables de entorno deben estar configuradas en tu proyecto
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

// Función para registrar webhooks después de la conexión exitosa
async function registerShopifyWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    {
      topic: "products/create",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products/create`,
    },
    {
      topic: "products/update",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products/update`,
    },
    {
      topic: "products/delete",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify/products/delete`,
    },
  ];

  const results = [];
  for (const webhook of webhooks) {
    try {
      const response = await fetch(
        `https://${shop}/admin/api/2025-04/webhooks.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": accessToken,
          },
          body: JSON.stringify({ webhook }),
        }
      );

      if (!response.ok) {
        console.error(
          `Error al registrar webhook ${webhook.topic}:`,
          await response.text()
        );
        results.push({ topic: webhook.topic, success: false });
      } else {
        results.push({ topic: webhook.topic, success: true });
      }
    } catch (error) {
      console.error(`Error al registrar webhook ${webhook.topic}:`, error);
      results.push({ topic: webhook.topic, success: false });
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !code || !state) {
    return NextResponse.redirect(
      new URL(
        `/error?message=Parámetros faltantes en la respuesta de Shopify`,
        request.url
      )
    );
  }

  try {
    const supabase = createClient(cookies());

    // Verificar el estado para prevenir ataques CSRF
    const { data: authState, error: stateError } = await supabase
      .from("shopify_auth_states")
      .select("business_id, user_id")
      .eq("state", state)
      .single();

    if (stateError || !authState) {
      return NextResponse.redirect(
        new URL(`/error?message=Estado inválido o expirado`, request.url)
      );
    }

    // Verificar si ya existe una integración para esta tienda en CUALQUIER negocio
    const { data: existingIntegrationAnyBusiness } = await supabase
      .from("shopify_integrations")
      .select("id, business_id")
      .eq("shop_domain", shop)
      .eq("status", "active")
      .neq("business_id", authState.business_id)
      .single();

    // Si ya existe una integración con este dominio en otro negocio, redirigir con error
    if (existingIntegrationAnyBusiness) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/${authState.business_id}/products/shopify?status=error&message=Esta tienda de Shopify ya está conectada a otro negocio.`,
          request.url
        )
      );
    }

    // Intercambiar el código de autorización por un token de acceso
    const accessTokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_API_KEY,
          client_secret: SHOPIFY_API_SECRET,
          code,
        }),
      }
    );

    if (!accessTokenResponse.ok) {
      throw new Error(
        `Error al obtener el token de acceso: ${accessTokenResponse.statusText}`
      );
    }

    const { access_token } = await accessTokenResponse.json();

    // Registrar webhooks
    const webhookResults = await registerShopifyWebhooks(shop, access_token);

    // Obtener información de la tienda
    const shopInfoResponse = await fetch(
      `https://${shop}/admin/api/2025-04/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": access_token,
        },
      }
    );

    if (!shopInfoResponse.ok) {
      throw new Error(
        `Error al obtener información de la tienda: ${shopInfoResponse.statusText}`
      );
    }

    const { shop: shopInfo } = await shopInfoResponse.json();

    // Verificar si ya existe una integración para esta tienda en el negocio actual
    const { data: existingIntegration } = await supabase
      .from("shopify_integrations")
      .select("id, status")
      .eq("shop_domain", shop)
      .eq("business_id", authState.business_id)
      .single();

    if (existingIntegration) {
      // Actualizar la integración existente
      await supabase
        .from("shopify_integrations")
        .update({
          access_token,
          shop_name: shopInfo.name,
          shop_owner: shopInfo.shop_owner,
          shop_email: shopInfo.email,
          shop_plan: shopInfo.plan_name,
          shop_currency: shopInfo.currency,
          shop_timezone: shopInfo.timezone,
          shop_locale: shopInfo.primary_locale,
          status: "active",
          connected_at: new Date().toISOString(),
          webhooks: {
            registration: webhookResults,
            last_updated: new Date().toISOString(),
          },
        })
        .eq("id", existingIntegration.id);
    } else {
      // Crear una nueva integración
      await supabase.from("shopify_integrations").insert({
        business_id: authState.business_id,
        shop_domain: shop,
        shop_name: shopInfo.name,
        shop_owner: shopInfo.shop_owner,
        shop_email: shopInfo.email,
        shop_plan: shopInfo.plan_name,
        shop_currency: shopInfo.currency,
        shop_timezone: shopInfo.timezone,
        shop_locale: shopInfo.primary_locale,
        access_token,
        status: "active",
        connected_at: new Date().toISOString(),
        webhooks: {
          registration: webhookResults,
          last_updated: new Date().toISOString(),
        },
      });
    }

    // Eliminar el estado usado
    await supabase.from("shopify_auth_states").delete().eq("state", state);

    // Redirigir al usuario a la página de integración con un mensaje de éxito
    return NextResponse.redirect(
      new URL(
        `/dashboard/${authState.business_id}/products/shopify?status=success&message=Tienda de Shopify conectada exitosamente.`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error en el callback de Shopify:", error);

    // Intentar obtener el business_id para la redirección
    try {
      const supabase = createClient(cookies());
      const { data: authStateData } = await supabase
        .from("shopify_auth_states")
        .select("business_id")
        .eq("state", state || "")
        .single();

      if (authStateData?.business_id) {
        return NextResponse.redirect(
          new URL(
            `/dashboard/${authStateData.business_id}/products/shopify?status=error&message=Error al procesar la respuesta de Shopify.`,
            request.url
          )
        );
      }
    } catch (redirectError) {
      console.error(
        "Error al intentar redirigir después de un error:",
        redirectError
      );
    }

    return NextResponse.redirect(
      new URL(
        `/error?message=Error al procesar la respuesta de Shopify`,
        request.url
      )
    );
  }
}
