import { NextResponse } from "next/server";
import { decrypt } from "@/utils/encryption";
import { createAdminClient } from "@/utils/supabase/admin";
import { z } from "zod";

// Esquemas de validación para productos
const dimensionItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const specItemSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

// Definir tipos para mejorar la seguridad y legibilidad del código
interface SyncStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  stats?: SyncStats;
}

interface ProcessedCount {
  total: number;
  success: number;
  error: number;
}

interface ApiIntegration {
  id: number;
  provider_branch_id: string;
  provider: string;
  api_url: string;
  api_key: string;
  api_secret: string | null;
  additional_params: any;
  sync_frequency: string;
  last_sync_at: string | null;
}

interface MappedProduct {
  name: string;
  short_name: string;
  description: string;
  short_description: string;
  brand_id: number | null;
  dimensions: { label: string; value: string }[];
  specs: { label: string; value: string }[];
  keywords: string[];
  images_url: string[];
  subcategory_id: number;
  variant: {
    name: string;
    display_name: string;
    options: {
      name: string;
      display_name: string;
      price: number;
      stock: number;
      is_default: boolean;
      sku: string;
      metadata: {
        external_id: string;
        source: string;
        last_updated: string;
        [key: string]: any;
      };
    }[];
  };
}

// Esta ruta será llamada por el cronjob de Vercel
export async function GET(request: Request) {
  try {
    // Verificar clave secreta para seguridad
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const specificBranchId = searchParams.get("branchId");

    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Crear cliente de Supabase con permisos de administrador para operaciones de escritura
    const supabase = createAdminClient();

    // Obtener todas las integraciones de API con sincronización automática habilitada
    // Si se proporciona un branchId específico, solo sincronizar ese
    let query = supabase
      .from("api_integrations")
      .select("*")
      .eq("auto_sync", true);

    if (specificBranchId) {
      query = query.eq("provider_branch_id", specificBranchId);
    }

    const { data: integrations, error: integrationError } = await query;

    if (integrationError) {
      console.error("Error fetching API integrations:", integrationError);
      return NextResponse.json(
        { error: integrationError.message },
        { status: 500 }
      );
    }

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({
        message: "No integrations configured for auto-sync",
      });
    }

    const now = new Date();
    const results: any[] = [];
    const processedCount: ProcessedCount = { total: 0, success: 0, error: 0 };

    // Procesar cada integración en lotes para evitar sobrecargar el servidor
    const batchSize = 5; // Procesar 5 integraciones a la vez

    for (let i = 0; i < integrations.length; i += batchSize) {
      const batch = integrations.slice(i, i + batchSize);
      const batchPromises = batch.map(async (integration: ApiIntegration) => {
        try {
          processedCount.total++;

          // Determinar si es hora de sincronizar según la frecuencia configurada
          let shouldSync = false;

          if (!integration.last_sync_at) {
            shouldSync = true;
          } else {
            const lastSync = new Date(integration.last_sync_at);
            const hoursSinceLastSync =
              (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

            switch (integration.sync_frequency) {
              case "hourly":
                shouldSync = hoursSinceLastSync >= 1;
                break;
              case "daily":
                shouldSync = hoursSinceLastSync >= 24;
                break;
              case "weekly":
                shouldSync = hoursSinceLastSync >= 168; // 7 * 24
                break;
              default:
                shouldSync = hoursSinceLastSync >= 24; // Default to daily
            }
          }

          if (shouldSync) {
            // Desencriptar las claves API para usarlas en la sincronización
            const apiKey = decrypt(integration.api_key);
            const apiSecret = integration.api_secret
              ? decrypt(integration.api_secret)
              : null;

            // Sincronizar productos según el proveedor
            const syncResult = await syncProviderProducts(
              {
                ...integration,
                api_key: apiKey,
                api_secret: apiSecret,
              },
              supabase
            );

            // Actualizar el timestamp de última sincronización
            await supabase
              .from("api_integrations")
              .update({
                last_sync_at: new Date().toISOString(),
                last_sync_status: syncResult.success ? "success" : "error",
                last_sync_message: syncResult.message,
                updated_at: new Date().toISOString(),
              })
              .eq("id", integration.id);

            results.push({
              branchId: integration.provider_branch_id,
              provider: integration.provider,
              status: syncResult.success ? "success" : "error",
              message: syncResult.message,
              stats: syncResult.stats,
            });

            if (syncResult.success) {
              processedCount.success++;
            } else {
              processedCount.error++;
            }
          } else {
            results.push({
              branchId: integration.provider_branch_id,
              provider: integration.provider,
              status: "skipped",
              message:
                "No necesita sincronización según la frecuencia configurada",
            });
          }
        } catch (error) {
          console.error(
            `Error syncing ${integration.provider} for branch ${integration.provider_branch_id}:`,
            error
          );
          processedCount.error++;

          results.push({
            branchId: integration.provider_branch_id,
            provider: integration.provider,
            status: "error",
            message:
              error instanceof Error ? error.message : "Error desconocido",
          });

          // Actualizar el estado de error en la base de datos
          await supabase
            .from("api_integrations")
            .update({
              last_sync_status: "error",
              last_sync_message:
                error instanceof Error ? error.message : "Error desconocido",
              updated_at: new Date().toISOString(),
            })
            .eq("id", integration.id);
        }
      });

      // Esperar a que se complete el lote actual antes de continuar con el siguiente
      await Promise.all(batchPromises);

      // Pequeña pausa entre lotes para no sobrecargar la API
      if (i + batchSize < integrations.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return NextResponse.json({
      success: true,
      message: `Proceso de sincronización completado. Total: ${processedCount.total}, Éxitos: ${processedCount.success}, Errores: ${processedCount.error}`,
      results,
    });
  } catch (error) {
    console.error("Error in sync products:", error);
    return NextResponse.json(
      { error: "Error syncing products" },
      { status: 500 }
    );
  }
}

// Función para sincronizar productos según el proveedor
async function syncProviderProducts(
  integration: ApiIntegration & { api_key: string; api_secret: string | null },
  supabase: any
): Promise<SyncResult> {
  try {
    console.log(
      `Iniciando sincronización con ${integration.provider} para branch ${integration.provider_branch_id}`
    );

    let products: any[] = [];

    // Obtener productos según el proveedor
    switch (integration.provider) {
      case "wondersign":
        products = await fetchWondersignProducts(integration);
        break;
      case "shopify":
        products = await fetchShopifyProducts(integration);
        break;
      case "woocommerce":
        products = await fetchWooCommerceProducts(integration);
        break;
      case "magento":
        products = await fetchMagentoProducts(integration);
        break;
      case "custom":
        products = await fetchCustomProducts(integration);
        break;
      default:
        throw new Error("Proveedor no soportado");
    }

    if (!products || products.length === 0) {
      return {
        success: true,
        message: "No se encontraron productos para sincronizar",
        stats: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
      };
    }

    // Procesar y sincronizar productos
    const stats = await processProducts(
      products,
      supabase,
      integration.provider_branch_id,
      integration.provider,
      integration.additional_params,
      integration
    );

    return {
      success: true,
      message: `Sincronización completada: ${stats.created} creados, ${stats.updated} actualizados, ${stats.errors} errores`,
      stats,
    };
  } catch (error) {
    console.error(`Error en sincronización de ${integration.provider}:`, error);
    return {
      success: false,
      message: `Error al sincronizar productos de ${integration.provider}: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`,
    };
  }
}

// Implementar las funciones de obtención de productos
async function fetchWondersignProducts(
  integration: ApiIntegration & { api_key: string; api_secret: string | null }
): Promise<any[]> {
  try {
    console.log("Obteniendo productos de Wondersign API:", integration.api_url);

    const response = await fetch(`${integration.api_url}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${integration.api_key}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de API Wondersign:", response.status, errorText);
      throw new Error(
        `Error de API Wondersign: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error obteniendo productos de Wondersign:", error);
    throw error;
  }
}

async function fetchShopifyProducts(
  integration: ApiIntegration & { api_key: string; api_secret: string | null }
): Promise<any[]> {
  try {
    console.log("Obteniendo productos de Shopify:", integration.api_url);

    const response = await fetch(`${integration.api_url}/products.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": integration.api_key,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de API Shopify:", response.status, errorText);
      throw new Error(
        `Error de API Shopify: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error obteniendo productos de Shopify:", error);
    throw error;
  }
}

async function fetchWooCommerceProducts(
  integration: ApiIntegration & { api_key: string; api_secret: string | null }
): Promise<any[]> {
  try {
    console.log("Obteniendo productos de WooCommerce:", integration.api_url);

    const response = await fetch(
      `${integration.api_url}/wp-json/wc/v3/products`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${integration.api_key}:${integration.api_secret}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de API WooCommerce:", response.status, errorText);
      throw new Error(
        `Error de API WooCommerce: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error obteniendo productos de WooCommerce:", error);
    throw error;
  }
}

async function fetchMagentoProducts(
  integration: ApiIntegration & { api_key: string; api_secret: string | null }
): Promise<any[]> {
  try {
    console.log("Obteniendo productos de Magento:", integration.api_url);

    // Primero obtener un token de Magento
    const tokenResponse = await fetch(
      `${integration.api_url}/rest/V1/integration/admin/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: integration.api_key,
          password: integration.api_secret,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(
        `Error de autenticación con Magento: ${tokenResponse.statusText}`
      );
    }

    const token = await tokenResponse.text();

    // Obtener productos con el token
    const response = await fetch(
      `${integration.api_url}/rest/V1/products?searchCriteria[pageSize]=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.replace(/"/g, "")}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de API Magento:", response.status, errorText);
      throw new Error(
        `Error de API Magento: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error obteniendo productos de Magento:", error);
    throw error;
  }
}

async function fetchCustomProducts(
  integration: ApiIntegration & { api_key: string; api_secret: string | null }
): Promise<any[]> {
  try {
    console.log(
      "Obteniendo productos de API personalizada:",
      integration.api_url
    );

    // Configurar headers según la configuración
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Agregar autenticación si se proporcionó
    if (integration.api_key) {
      headers["Authorization"] = `Bearer ${integration.api_key}`;
    }

    const response = await fetch(integration.api_url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de API personalizada:", response.status, errorText);
      throw new Error(
        `Error de API personalizada: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Intentar determinar dónde están los productos en la respuesta
    const products = data.products || data.items || data;

    return Array.isArray(products) ? products : [products];
  } catch (error) {
    console.error("Error obteniendo productos de API personalizada:", error);
    throw error;
  }
}

// Implementar la función de procesamiento de productos
async function processProducts(
  products: any[],
  supabase: any,
  branchId: string,
  provider: string,
  mappingConfig: any = null,
  integration: any = null
): Promise<SyncStats> {
  // Estadísticas de sincronización
  const stats: SyncStats = {
    total: products.length,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  // Obtener todas las marcas para mapeo
  const { data: brands } = await supabase
    .from("catalog_brands")
    .select("id, name");

  // Obtener todas las categorías para mapeo
  const { data: categories } = await supabase
    .from("catalog_collections")
    .select("id, name, level");

  const brandMap = new Map<string, number>();
  if (brands) {
    brands.forEach((brand: any) => {
      brandMap.set(brand.name.toLowerCase(), brand.id);
    });
  }

  const categoryMap = new Map<string, number>();
  if (categories) {
    categories.forEach((category: any) => {
      if (category.level === 2) {
        // Solo subcategorías
        categoryMap.set(category.name.toLowerCase(), category.id);
      }
    });
  }

  // Procesar productos en lotes para no sobrecargar la base de datos
  const batchSize = 20;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    for (const product of batch) {
      try {
        // Mapear producto según el proveedor
        const mappedProduct = mapProductData(
          product,
          provider,
          brandMap,
          categoryMap,
          mappingConfig,
          integration
        );

        if (!mappedProduct || !mappedProduct.variant.options[0].sku) {
          console.log(
            `Producto sin SKU, omitiendo: ${JSON.stringify(
              product.name || "Desconocido"
            )}`
          );
          stats.skipped++;
          continue;
        }

        // Verificar si el producto ya existe por SKU
        const { data: existingVariantOption, error: findError } = await supabase
          .from("products_variant_options")
          .select("id, variant_id, product_id")
          .eq("sku", mappedProduct.variant.options[0].sku)
          .single();

        if (findError && findError.code !== "PGSQL_ERROR_NO_ROWS") {
          console.error("Error buscando producto por SKU:", findError);
          stats.errors++;
          continue;
        }

        if (existingVariantOption) {
          // Actualizar producto existente
          console.log(
            `Actualizando producto existente: ${mappedProduct.name}, SKU: ${mappedProduct.variant.options[0].sku}`
          );

          // Convertir dimensiones y specs al formato de la base de datos
          const dimensionsJson =
            mappedProduct.dimensions.length > 0
              ? mappedProduct.dimensions.reduce((acc, item) => {
                  acc[item.label] = item.value;
                  return acc;
                }, {} as Record<string, string>)
              : null;

          const specsJson =
            mappedProduct.specs.length > 0
              ? mappedProduct.specs.reduce((acc, item) => {
                  acc[item.label] = item.value;
                  return acc;
                }, {} as Record<string, string>)
              : null;

          const { error: productError } = await supabase
            .from("products")
            .update({
              name: mappedProduct.name,
              short_name: mappedProduct.short_name,
              description: mappedProduct.description,
              short_description: mappedProduct.short_description,
              brand_id: mappedProduct.brand_id,
              dimensions: dimensionsJson,
              specs: specsJson,
              keywords: mappedProduct.keywords,
              images_url: mappedProduct.images_url,
              subcategory_id: mappedProduct.subcategory_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingVariantOption.product_id);

          if (productError) {
            console.error("Error actualizando producto:", productError);
            stats.errors++;
            continue;
          }

          // Actualizar opción de variante
          const { error: variantOptionError } = await supabase
            .from("products_variant_options")
            .update({
              price: mappedProduct.variant.options[0].price,
              stock: mappedProduct.variant.options[0].stock,
              metadata: mappedProduct.variant.options[0].metadata,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingVariantOption.id);

          if (variantOptionError) {
            console.error(
              "Error actualizando opción de variante:",
              variantOptionError
            );
            stats.errors++;
            continue;
          }

          stats.updated++;
        } else {
          // Crear nuevo producto
          console.log(
            `Creando nuevo producto: ${mappedProduct.name}, SKU: ${mappedProduct.variant.options[0].sku}`
          );

          // Convertir dimensiones y specs al formato de la base de datos
          const dimensionsJson =
            mappedProduct.dimensions.length > 0
              ? mappedProduct.dimensions.reduce((acc, item) => {
                  acc[item.label] = item.value;
                  return acc;
                }, {} as Record<string, string>)
              : null;

          const specsJson =
            mappedProduct.specs.length > 0
              ? mappedProduct.specs.reduce((acc, item) => {
                  acc[item.label] = item.value;
                  return acc;
                }, {} as Record<string, string>)
              : null;

          const { data: newProduct, error: productError } = await supabase
            .from("products")
            .insert({
              name: mappedProduct.name,
              short_name: mappedProduct.short_name,
              description: mappedProduct.description,
              short_description: mappedProduct.short_description,
              brand_id: mappedProduct.brand_id,
              dimensions: dimensionsJson,
              specs: specsJson,
              keywords: mappedProduct.keywords,
              images_url: mappedProduct.images_url,
              subcategory_id: mappedProduct.subcategory_id,
              provider_branch_id: branchId,
              status: "draft", // Los productos nuevos comienzan como borrador
            })
            .select()
            .single();

          if (productError) {
            console.error("Error creando producto:", productError);
            stats.errors++;
            continue;
          }

          // Crear variante
          const { data: newVariant, error: variantError } = await supabase
            .from("products_variants")
            .insert({
              product_id: newProduct.id,
              name: mappedProduct.variant.name,
              display_name: mappedProduct.variant.display_name,
              position: 0,
            })
            .select()
            .single();

          if (variantError) {
            console.error("Error creando variante:", variantError);
            stats.errors++;
            continue;
          }

          // Crear opción de variante
          const variantOption = mappedProduct.variant.options[0];
          const { error: variantOptionError } = await supabase
            .from("products_variant_options")
            .insert({
              variant_id: newVariant.id,
              name: variantOption.name,
              display_name: variantOption.display_name,
              price: variantOption.price,
              stock: variantOption.stock,
              position: 0,
              is_default: variantOption.is_default,
              sku: variantOption.sku,
              metadata: variantOption.metadata,
              images_url: mappedProduct.images_url, // Usar las mismas imágenes del producto
            });

          if (variantOptionError) {
            console.error(
              "Error creando opción de variante:",
              variantOptionError
            );
            stats.errors++;
            continue;
          }

          stats.created++;
        }
      } catch (error) {
        console.error("Error procesando producto:", error);
        stats.errors++;
      }
    }

    // Pequeña pausa entre lotes
    if (i + batchSize < products.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return stats;
}

// Implementar la función de mapeo de productos
function mapProductData(
  product: any,
  provider: string,
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>,
  mappingConfig: any = null,
  integration: any = null
): MappedProduct | null {
  // Implementar la lógica de mapeo según el proveedor
  switch (provider) {
    case "wondersign":
      return mapWondersignProduct(product, brandMap, categoryMap);
    case "shopify":
      return mapShopifyProduct(product, brandMap, categoryMap);
    case "woocommerce":
      return mapWooCommerceProduct(product, brandMap, categoryMap);
    case "magento":
      return mapMagentoProduct(product, brandMap, categoryMap, integration);
    case "custom":
      return mapCustomProduct(product, brandMap, categoryMap, mappingConfig);
    default:
      return null;
  }
}

// Implementar las funciones de mapeo específicas
function mapWondersignProduct(
  product: any,
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>
): MappedProduct {
  // Intentar encontrar la marca o usar ID predeterminado
  let brandId = null;
  if (product.brand) {
    const brandName = product.brand.toLowerCase();
    if (brandMap.has(brandName)) {
      brandId = brandMap.get(brandName);
    }
  }

  // Intentar encontrar la categoría o usar ID predeterminada
  let subcategoryId = 1; // Categoría predeterminada
  if (product.category) {
    const categoryName = product.category.toLowerCase();
    if (categoryMap.has(categoryName)) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId !== undefined) {
        subcategoryId = categoryId;
      }
    }
  }

  // Extraer dimensiones si existen
  const dimensions: { label: string; value: string }[] = [];
  if (product.dimensions) {
    // Wondersign puede tener dimensiones en diferentes formatos
    if (typeof product.dimensions === "object") {
      Object.entries(product.dimensions).forEach(([key, value]) => {
        dimensions.push({
          label: key,
          value: value as string,
        });
      });
    } else if (typeof product.dimensions === "string") {
      dimensions.push({
        label: "Dimensiones",
        value: product.dimensions,
      });
    }
  }

  // Extraer especificaciones si existen
  const specs: { label: string; value: string }[] = [];
  if (product.specifications) {
    if (Array.isArray(product.specifications)) {
      product.specifications.forEach((spec: any) => {
        if (spec.name && spec.value) {
          specs.push({
            label: spec.name,
            value: spec.value,
          });
        }
      });
    } else if (typeof product.specifications === "object") {
      Object.entries(product.specifications).forEach(([key, value]) => {
        specs.push({
          label: key,
          value: value as string,
        });
      });
    }
  }

  // Extraer imágenes
  const images: string[] = [];
  if (product.images && Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string") {
        images.push(img);
      } else if (img.url) {
        images.push(img.url);
      }
    }
  }

  // Crear descripción corta
  let shortDescription = "";
  if (product.short_description) {
    shortDescription = product.short_description;
  } else if (product.description) {
    // Limitar a 150 caracteres y asegurar que no corte palabras
    shortDescription = product.description.substring(0, 147) + "...";
  }

  // Extraer palabras clave
  const keywords = extractKeywords(
    product.name + " " + (product.description || "")
  );

  return {
    name: product.name || "Unnamed Product",
    short_name: (product.short_name || product.name || "").substring(0, 50),
    description: product.description || "",
    short_description: shortDescription,
    brand_id: brandId!,
    dimensions,
    specs,
    keywords,
    images_url: images,
    subcategory_id: subcategoryId,
    variant: {
      name: "default",
      display_name: "Default",
      options: [
        {
          name: "default",
          display_name: "Default",
          price: Number.parseFloat(product.price) || 0,
          stock: Number.parseInt(
            product.inventory_quantity || product.stock || "0",
            10
          ),
          is_default: true,
          sku: product.sku || "",
          metadata: {
            external_id: product.id,
            source: "wondersign",
            last_updated: new Date().toISOString(),
          },
        },
      ],
    },
  };
}

function mapShopifyProduct(
  product: any,
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>
): MappedProduct {
  // Mapeo para Shopify
  const variant = product.variants?.[0] || {};

  // Intentar extraer marca del vendor o de las etiquetas
  let brandId = null;
  if (product.vendor) {
    const brandName = product.vendor.toLowerCase();
    if (brandMap.has(brandName)) {
      brandId = brandMap.get(brandName);
    }
  }

  // Intentar extraer categoría de las colecciones o etiquetas
  let subcategoryId = 1; // Categoría predeterminada
  if (product.product_type) {
    const categoryName = product.product_type.toLowerCase();
    if (categoryMap.has(categoryName)) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId !== undefined) {
        subcategoryId = categoryId;
      }
    }
  }

  // Extraer imágenes
  const images = product.images?.map((img: any) => img.src) || [];

  // Extraer palabras clave de las etiquetas
  let keywords: string[] = [];
  if (product.tags) {
    if (typeof product.tags === "string") {
      keywords = product.tags.split(",").map((tag: string) => tag.trim());
    } else if (Array.isArray(product.tags)) {
      keywords = product.tags;
    }
  }

  if (keywords.length === 0) {
    keywords = extractKeywords(product.title + " " + (product.body_html || ""));
  }

  // Crear descripción corta
  let shortDescription = "";
  if (product.body_html) {
    // Eliminar etiquetas HTML para la descripción corta
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = product.body_html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    shortDescription = textContent.substring(0, 147) + "...";
  }

  // Extraer dimensiones y especificaciones
  const dimensions: { label: string; value: string }[] = [];
  const specs: { label: string; value: string }[] = [];

  // Shopify puede tener metafields para dimensiones y specs
  if (product.metafields) {
    product.metafields.forEach((field: any) => {
      if (field.namespace === "dimensions") {
        dimensions.push({
          label: field.key,
          value: field.value,
        });
      } else if (field.namespace === "specifications") {
        specs.push({
          label: field.key,
          value: field.value,
        });
      }
    });
  }

  return {
    name: product.title,
    short_name: product.title.substring(0, 50),
    description: product.body_html || "",
    short_description: shortDescription,
    brand_id: brandId!,
    dimensions,
    specs,
    keywords,
    images_url: images,
    subcategory_id: subcategoryId,
    variant: {
      name: "default",
      display_name: "Default",
      options: [
        {
          name: "default",
          display_name: "Default",
          price: Number.parseFloat(variant.price) || 0,
          stock: Number.parseInt(variant.inventory_quantity || "0", 10),
          is_default: true,
          sku: variant.sku || "",
          metadata: {
            external_id: product.id,
            source: "shopify",
            last_updated: new Date().toISOString(),
          },
        },
      ],
    },
  };
}

function mapWooCommerceProduct(
  product: any,
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>
): MappedProduct {
  // Mapeo para WooCommerce

  // Intentar extraer marca de los atributos o categorías
  let brandId = null;
  if (product.attributes) {
    const brandAttr = product.attributes.find(
      (attr: any) =>
        attr.name.toLowerCase() === "brand" ||
        attr.name.toLowerCase() === "marca"
    );
    if (brandAttr && brandAttr.options && brandAttr.options.length > 0) {
      const brandName = brandAttr.options[0].toLowerCase();
      if (brandMap.has(brandName)) {
        brandId = brandMap.get(brandName);
      }
    }
  }

  // Intentar extraer categoría
  let subcategoryId = 1; // Categoría predeterminada
  if (product.categories && product.categories.length > 0) {
    const category = product.categories[0];
    const categoryName = category.name.toLowerCase();
    if (categoryMap.has(categoryName)) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId !== undefined) {
        subcategoryId = categoryId;
      }
    }
  }

  // Extraer dimensiones
  const dimensions: { label: string; value: string }[] = [];
  if (product.dimensions) {
    if (product.dimensions.length) {
      dimensions.push({ label: "Largo", value: product.dimensions.length });
    }
    if (product.dimensions.width) {
      dimensions.push({ label: "Ancho", value: product.dimensions.width });
    }
    if (product.dimensions.height) {
      dimensions.push({ label: "Alto", value: product.dimensions.height });
    }
  }

  // Extraer especificaciones de los atributos
  const specs: { label: string; value: string }[] = [];
  if (product.attributes) {
    product.attributes.forEach((attr: any) => {
      if (attr.name && attr.options && attr.options.length > 0) {
        specs.push({
          label: attr.name,
          value: attr.options.join(", "),
        });
      }
    });
  }

  // Extraer imágenes
  const images = product.images?.map((img: any) => img.src) || [];

  // Extraer palabras clave
  const keywords = extractKeywords(
    product.name + " " + (product.description || "")
  );

  return {
    name: product.name,
    short_name: product.name.substring(0, 50),
    description: product.description || "",
    short_description:
      product.short_description ||
      product.description?.substring(0, 147) + "..." ||
      "",
    brand_id: brandId!,
    dimensions,
    specs,
    keywords,
    images_url: images,
    subcategory_id: subcategoryId,
    variant: {
      name: "default",
      display_name: "Default",
      options: [
        {
          name: "default",
          display_name: "Default",
          price: Number.parseFloat(product.price) || 0,
          stock: Number.parseInt(product.stock_quantity || "0", 10),
          is_default: true,
          sku: product.sku || "",
          metadata: {
            external_id: product.id,
            source: "woocommerce",
            last_updated: new Date().toISOString(),
          },
        },
      ],
    },
  };
}

function mapMagentoProduct(
  product: any,
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>,
  integration: any
): MappedProduct {
  // Mapeo para Magento

  // Extraer atributos personalizados
  const getCustomAttribute = (code: string) => {
    if (!product.custom_attributes) return null;
    const attr = product.custom_attributes.find(
      (a: any) => a.attribute_code === code
    );
    return attr ? attr.value : null;
  };

  // Intentar extraer marca
  let brandId = null;
  const brandValue = getCustomAttribute("manufacturer");
  if (brandValue) {
    const brandName = brandValue.toLowerCase();
    if (brandMap.has(brandName)) {
      brandId = brandMap.get(brandName);
    }
  }

  // Intentar extraer categoría
  let subcategoryId = 1; // Categoría predeterminada
  if (
    product.extension_attributes &&
    product.extension_attributes.category_links
  ) {
    for (const catLink of product.extension_attributes.category_links) {
      const categoryId = Number.parseInt(catLink.category_id);
      if (!isNaN(categoryId)) {
        subcategoryId = categoryId;
      }
    }
  }

  // Extraer descripción
  const description = getCustomAttribute("description") || "";
  const shortDescription =
    getCustomAttribute("short_description") ||
    description.substring(0, 147) + "...";

  // Extraer dimensiones
  const dimensions: { label: string; value: string }[] = [];
  const width = getCustomAttribute("width");
  const height = getCustomAttribute("height");
  const depth = getCustomAttribute("depth");

  if (width) dimensions.push({ label: "Ancho", value: width });
  if (height) dimensions.push({ label: "Alto", value: height });
  if (depth) dimensions.push({ label: "Profundidad", value: depth });

  // Extraer especificaciones
  const specs: { label: string; value: string }[] = [];
  if (product.custom_attributes) {
    product.custom_attributes.forEach((attr: any) => {
      // Excluir atributos ya procesados
      if (
        ![
          "description",
          "short_description",
          "manufacturer",
          "width",
          "height",
          "depth",
        ].includes(attr.attribute_code)
      ) {
        specs.push({
          label: attr.attribute_code,
          value: attr.value,
        });
      }
    });
  }

  // Extraer imágenes
  const images: string[] = [];
  if (product.media_gallery_entries) {
    for (const entry of product.media_gallery_entries) {
      if (entry.file) {
        const baseUrl = integration.api_url.replace(/\/rest\/.*$/, "");
        images.push(`${baseUrl}/pub/media/catalog/product${entry.file}`);
      }
    }
  }

  // Extraer palabras clave
  const keywords = extractKeywords(product.name + " " + description);

  return {
    name: product.name,
    short_name: product.name.substring(0, 50),
    description,
    short_description: shortDescription,
    brand_id: brandId!,
    dimensions,
    specs,
    keywords,
    images_url: images,
    subcategory_id: subcategoryId,
    variant: {
      name: "default",
      display_name: "Default",
      options: [
        {
          name: "default",
          display_name: "Default",
          price: Number.parseFloat(product.price) || 0,
          stock: 0, // Magento maneja el inventario por separado
          is_default: true,
          sku: product.sku || "",
          metadata: {
            external_id: product.id,
            source: "magento",
            last_updated: new Date().toISOString(),
          },
        },
      ],
    },
  };
}

function mapCustomProduct(
  product: any,
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>,
  mappingConfig: any
): MappedProduct | null {
  // Mapeo para API personalizada
  if (!mappingConfig) {
    console.log(
      "No se proporcionó configuración de mapeo para API personalizada"
    );
    return null;
  }

  // Extraer valores según la configuración de mapeo
  const getValue = (path: string) => {
    if (!path) return null;

    const keys = path.split(".");
    let value = product;

    for (const key of keys) {
      if (value === undefined || value === null) return null;
      value = value[key];
    }

    return value;
  };

  // Intentar extraer marca
  let brandId = null;
  const brandValue = getValue(mappingConfig.brand_field);
  if (brandValue) {
    const brandName = brandValue.toLowerCase();
    if (brandMap.has(brandName)) {
      brandId = brandMap.get(brandName);
    }
  }

  // Intentar extraer categoría
  let subcategoryId = 1; // Categoría predeterminada
  const categoryValue = getValue(mappingConfig.category_field);
  if (categoryValue) {
    const categoryName = categoryValue.toLowerCase();
    if (categoryMap.has(categoryName)) {
      const categoryId = categoryMap.get(categoryName);
      if (categoryId !== undefined) {
        subcategoryId = categoryId;
      }
    }
  }

  // Extraer nombre y descripción
  const name = getValue(mappingConfig.name_field) || "Producto sin nombre";
  const description = getValue(mappingConfig.description_field) || "";
  const shortDescription =
    getValue(mappingConfig.short_description_field) ||
    description.substring(0, 147) + "...";

  // Extraer dimensiones
  const dimensions: { label: string; value: string }[] = [];
  const dimensionsValue = getValue(mappingConfig.dimensions_field);
  if (dimensionsValue && typeof dimensionsValue === "object") {
    Object.entries(dimensionsValue).forEach(([key, value]) => {
      dimensions.push({
        label: key,
        value: value as string,
      });
    });
  }

  // Extraer especificaciones
  const specs: { label: string; value: string }[] = [];
  const specsValue = getValue(mappingConfig.specs_field);
  if (specsValue && typeof specsValue === "object") {
    Object.entries(specsValue).forEach(([key, value]) => {
      specs.push({
        label: key,
        value: value as string,
      });
    });
  }

  // Extraer imágenes
  let images: string[] = [];
  const imagesValue = getValue(mappingConfig.images_field);
  if (imagesValue) {
    if (Array.isArray(imagesValue)) {
      images = imagesValue;
    } else if (typeof imagesValue === "string") {
      images = [imagesValue];
    }
  }

  // Extraer palabras clave
  const keywords = extractKeywords(name + " " + description);

  return {
    name,
    short_name: name.substring(0, 50),
    description,
    short_description: shortDescription,
    brand_id: brandId!,
    dimensions,
    specs,
    keywords,
    images_url: images,
    subcategory_id: subcategoryId,
    variant: {
      name: "default",
      display_name: "Default",
      options: [
        {
          name: "default",
          display_name: "Default",
          price: Number.parseFloat(getValue(mappingConfig.price_field) || "0"),
          stock: Number.parseInt(
            getValue(mappingConfig.stock_field) || "0",
            10
          ),
          is_default: true,
          sku: getValue(mappingConfig.sku_field) || "",
          metadata: {
            external_id: getValue(mappingConfig.id_field),
            source: "custom",
            last_updated: new Date().toISOString(),
          },
        },
      ],
    },
  };
}

function extractKeywords(text: string): string[] {
  if (!text) return [];

  // Eliminar etiquetas HTML
  const cleanText = text.replace(/<[^>]*>/g, "");

  // Dividir en palabras, eliminar puntuación y filtrar palabras cortas
  const words = cleanText
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/[^\w\sáéíóúüñ]/g, ""))
    .filter((word) => word.length > 2);

  // Eliminar duplicados y limitar a 20 palabras clave
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, 20);
}
