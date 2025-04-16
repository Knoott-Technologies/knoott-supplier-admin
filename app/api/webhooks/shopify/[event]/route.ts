// app/api/webhooks/shopify/[event]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: { event: string } }
) {
  const event = params.event;
  const body = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  // Verificar la autenticidad del webhook
  const hmac = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET!)
    .update(body)
    .digest("base64");

  if (hmac !== hmacHeader) {
    console.error("Webhook inválido: firma HMAC no coincide");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(cookies());
  const data = JSON.parse(body);
  const shopDomain = request.headers.get("x-shopify-shop-domain");

  try {
    // Obtener la integración correspondiente a esta tienda
    const { data: integration } = await supabase
      .from("shopify_integrations")
      .select("id, business_id")
      .eq("shop_domain", shopDomain)
      .eq("status", "active")
      .single();

    if (!integration) {
      console.error(`No se encontró integración para la tienda ${shopDomain}`);
      return NextResponse.json(
        { message: "Integration not found" },
        { status: 404 }
      );
    }

    // Manejar diferentes tipos de eventos
    switch (event) {
      case "products/create":
      case "products/update":
        await handleProductUpdate(data, integration, supabase);
        break;
      case "products/delete":
        await handleProductDelete(data, integration, supabase);
        break;
      // Puedes añadir más casos según necesites
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error procesando webhook ${event}:`, error);
    return NextResponse.json(
      { message: "Error processing webhook" },
      { status: 500 }
    );
  }
}

async function handleProductUpdate(
  product: any,
  integration: { id: string; business_id: string },
  supabase: any
) {
  // Convertir el producto de Shopify al formato de tu plataforma
  const platformProduct = await convertShopifyProductToPlatformFormat(
    product,
    integration.business_id,
    supabase
  );

  // Verificar si el producto ya existe en tu plataforma
  const { data: existingShopifyProduct } = await supabase
    .from("shopify_products")
    .select("id, platform_product_id")
    .eq("integration_id", integration.id)
    .eq("shopify_id", product.id.toString())
    .single();

  if (existingShopifyProduct?.platform_product_id) {
    // Actualizar producto existente
    await supabase
      .from("products")
      .update(platformProduct)
      .eq("id", existingShopifyProduct.platform_product_id);

    // Actualizar variantes y opciones
    await syncProductVariants(
      product,
      existingShopifyProduct.platform_product_id,
      supabase
    );

    // Actualizar registro de sincronización
    await supabase
      .from("shopify_products")
      .update({
        title: product.title,
        synced_at: new Date().toISOString(),
        shopify_updated_at: product.updated_at,
      })
      .eq("id", existingShopifyProduct.id);
  } else {
    // Crear nuevo producto
    const { data: newProduct } = await supabase
      .from("products")
      .insert(platformProduct)
      .select("id")
      .single();

    if (newProduct) {
      // Crear variantes y opciones
      await syncProductVariants(product, newProduct.id, supabase);

      // Registrar producto de Shopify
      await supabase.from("shopify_products").insert({
        integration_id: integration.id,
        business_id: integration.business_id,
        shopify_id: product.id.toString(),
        shopify_product_id: product.id.toString(),
        title: product.title,
        platform_product_id: newProduct.id,
        shopify_created_at: product.created_at,
        shopify_updated_at: product.updated_at,
      });
    }
  }

  // Actualizar contador de productos en la integración
  await updateProductCount(integration.id, supabase);
}

async function handleProductDelete(
  product: any,
  integration: { id: string; business_id: string },
  supabase: any
) {
  // Buscar el producto en la tabla de mapeo
  const { data: shopifyProduct } = await supabase
    .from("shopify_products")
    .select("platform_product_id")
    .eq("integration_id", integration.id)
    .eq("shopify_id", product.id.toString())
    .single();

  if (shopifyProduct?.platform_product_id) {
    // Eliminar el producto de tu plataforma o marcarlo como inactivo
    await supabase
      .from("products")
      .update({ status: "inactive" })
      .eq("id", shopifyProduct.platform_product_id);

    // Eliminar el registro de mapeo
    await supabase
      .from("shopify_products")
      .delete()
      .eq("integration_id", integration.id)
      .eq("shopify_id", product.id.toString());

    // Actualizar contador de productos
    await updateProductCount(integration.id, supabase);
  }
}

async function convertShopifyProductToPlatformFormat(
  shopifyProduct: any,
  businessId: string,
  supabase: any
) {
  // Obtener la primera imagen si existe
  const images = shopifyProduct.images || [];
  const imagesUrl = images.map((img: any) => img.src);

  // Buscar o crear la marca
  let brandId = null;
  if (shopifyProduct.vendor) {
    const { data: existingBrand } = await supabase
      .from("catalog_brands")
      .select("id")
      .eq("name", shopifyProduct.vendor)
      .single();

    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      const { data: newBrand } = await supabase
        .from("catalog_brands")
        .insert({ name: shopifyProduct.vendor, status: "active" })
        .select("id")
        .single();

      if (newBrand) {
        brandId = newBrand.id;
      }
    }
  }

  // Buscar o asignar categoría
  let subcategoryId = 1; // Categoría por defecto
  if (shopifyProduct.product_type) {
    const { data: existingCategory } = await supabase
      .from("catalog_collections")
      .select("id")
      .eq("name", shopifyProduct.product_type)
      .single();

    if (existingCategory) {
      subcategoryId = existingCategory.id;
    }
  }

  return {
    name: shopifyProduct.title,
    short_name: shopifyProduct.title.substring(0, 50),
    description: shopifyProduct.body_html || "",
    short_description: shopifyProduct.body_html
      ? shopifyProduct.body_html.substring(0, 150).replace(/<[^>]*>/g, "")
      : "",
    brand_id: brandId,
    images_url: imagesUrl.length > 0 ? imagesUrl : [""],
    subcategory_id: subcategoryId,
    provider_business_id: businessId,
    status: shopifyProduct.status === "active" ? "active" : "draft",
    specs: shopifyProduct.tags ? { tags: shopifyProduct.tags } : null,
    keywords: shopifyProduct.tags ? shopifyProduct.tags.split(", ") : null,
  };
}

async function syncProductVariants(
  shopifyProduct: any,
  productId: number,
  supabase: any
) {
  // Primero, obtener las variantes existentes
  const { data: existingVariants } = await supabase
    .from("products_variants")
    .select("id, name")
    .eq("product_id", productId);

  const existingVariantMap = new Map();
  if (existingVariants) {
    existingVariants.forEach((v: any) => existingVariantMap.set(v.name, v.id));
  }

  // Si el producto tiene opciones (como talla, color, etc.)
  if (shopifyProduct.options && shopifyProduct.options.length > 0) {
    for (const option of shopifyProduct.options) {
      let variantId;

      // Verificar si la variante ya existe
      if (existingVariantMap.has(option.name)) {
        variantId = existingVariantMap.get(option.name);
      } else {
        // Crear nueva variante
        const { data: newVariant } = await supabase
          .from("products_variants")
          .insert({
            product_id: productId,
            name: option.name,
            display_name: option.name,
            position: option.position,
          })
          .select("id")
          .single();

        if (newVariant) {
          variantId = newVariant.id;
        }
      }

      if (variantId) {
        // Obtener opciones existentes para esta variante
        const { data: existingOptions } = await supabase
          .from("products_variant_options")
          .select("id, name")
          .eq("variant_id", variantId);

        const existingOptionMap = new Map();
        if (existingOptions) {
          existingOptions.forEach((o: any) =>
            existingOptionMap.set(o.name, o.id)
          );
        }

        // Sincronizar opciones de variante
        for (const value of option.values) {
          if (existingOptionMap.has(value)) {
            // La opción ya existe, podríamos actualizarla si es necesario
          } else {
            // Crear nueva opción
            await supabase.from("products_variant_options").insert({
              variant_id: variantId,
              name: value,
              display_name: value,
              position: option.values.indexOf(value),
              is_default: option.values.indexOf(value) === 0,
            });
          }
        }
      }
    }
  }

  // Sincronizar precios y stock desde las variantes de Shopify
  if (shopifyProduct.variants && shopifyProduct.variants.length > 0) {
    for (const variant of shopifyProduct.variants) {
      // Aquí necesitarías lógica para mapear las variantes de Shopify
      // a tus opciones de variante específicas
      // Este es un ejemplo simplificado
      const optionValues = variant.title.split(" / ");

      // Buscar la opción de variante correspondiente
      // Nota: Esta lógica puede necesitar ajustes según tu estructura de datos
      for (const optionValue of optionValues) {
        const { data: variantOption } = await supabase
          .from("products_variant_options")
          .select("id")
          .eq("name", optionValue)
          .eq("variant_id", existingVariantMap.values().next().value)
          .single();

        if (variantOption) {
          // Actualizar precio y stock
          await supabase
            .from("products_variant_options")
            .update({
              price: parseFloat(variant.price),
              stock: variant.inventory_quantity,
              sku: variant.sku,
            })
            .eq("id", variantOption.id);
        }
      }
    }
  }
}

async function updateProductCount(integrationId: string, supabase: any) {
  const { count } = await supabase
    .from("shopify_products")
    .select("id", { count: "exact" })
    .eq("integration_id", integrationId);

  await supabase
    .from("shopify_integrations")
    .update({
      product_count: count || 0,
      last_synced: new Date().toISOString(),
    })
    .eq("id", integrationId);
}
