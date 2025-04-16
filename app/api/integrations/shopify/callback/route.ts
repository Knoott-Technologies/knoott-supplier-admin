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

  for (const webhook of webhooks) {
    try {
      const response = await fetch(
        `https://${shop}/admin/api/2023-07/webhooks.json`,
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
      }
    } catch (error) {
      console.error(`Error al registrar webhook ${webhook.topic}:`, error);
    }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const host = searchParams.get("host");

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
    const { data: pendingConnection } = await supabase
      .from("shopify_integrations")
      .select("id, business_id, state")
      .eq("state", state)
      .eq("status", "pending")
      .single();

    if (!pendingConnection) {
      return NextResponse.redirect(
        new URL(
          `/error?message=Estado inválido o conexión no encontrada`,
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
    await registerShopifyWebhooks(shop, access_token);

    // Obtener información de la tienda
    const shopInfoResponse = await fetch(
      `https://${shop}/admin/api/2023-07/shop.json`,
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

    // Actualizar la conexión en la base de datos
    const { error } = await supabase
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
      })
      .eq("id", pendingConnection.id);

    if (error) {
      console.error("Error al actualizar la conexión:", error);
      return NextResponse.redirect(
        new URL(`/error?message=Error al finalizar la conexión`, request.url)
      );
    }

    // Redirigir al usuario a la página de integración con un mensaje de éxito
    return NextResponse.redirect(
      new URL(
        `/business/${pendingConnection.business_id}/integrations/shopify?success=true`,
        request.url
      )
    );
  } catch (error) {
    console.error("Error en el callback de Shopify:", error);
    return NextResponse.redirect(
      new URL(
        `/error?message=Error al procesar la respuesta de Shopify`,
        request.url
      )
    );
  }
}
