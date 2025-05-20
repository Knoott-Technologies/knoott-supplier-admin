import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export async function POST(request: Request) {
  try {
    const product = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

    // Generar el texto para el embedding combinando todos los datos relevantes del producto
    const embeddingText = generateProductText(product);

    // Generar el embedding utilizando la AI SDK de Vercel
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small", {
        dimensions: 1536,
      }),
      value: embeddingText,
    });

    // Insert the product into the database
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: product.name,
        short_name: product.short_name,
        description: product.description,
        short_description: product.short_description,
        brand_id: product.brand_id,
        subcategory_id: product.subcategory_id,
        provider_business_id: product.provider_business_id,
        images_url: product.images_url,
        shipping_cost: product.shipping_cost || 0,
        dimensions:
          product.dimensions?.length > 0
            ? product.dimensions.reduce(
                (
                  acc: Record<string, string>,
                  curr: { label: string; value: string }
                ) => {
                  acc[curr.label] = curr.value;
                  return acc;
                },
                {}
              )
            : null,
        specs:
          product.specs?.length > 0
            ? product.specs.reduce(
                (
                  acc: Record<string, string>,
                  curr: { label: string; value: string }
                ) => {
                  acc[curr.label] = curr.value;
                  return acc;
                },
                {}
              )
            : null,
        keywords: product.keywords || [],
        status: "requires_verification",
        embedding: embedding, // Guardamos el embedding generado
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

/**
 * Genera un texto completo con todos los datos relevantes del producto
 * para crear un embedding de alta calidad
 */
function generateProductText(product: any): string {
  const parts: string[] = [];

  // Información básica del producto
  parts.push(`Nombre: ${product.name}`);
  parts.push(`Nombre corto: ${product.short_name}`);
  parts.push(`Descripción: ${product.description}`);
  parts.push(`Descripción corta: ${product.short_description}`);

  // Palabras clave
  if (product.keywords && product.keywords.length > 0) {
    parts.push(`Palabras clave: ${product.keywords.join(", ")}`);
  }

  // Dimensiones
  if (product.dimensions && product.dimensions.length > 0) {
    const dimensionsText = product.dimensions
      .map(
        (dim: { label: string; value: string }) => `${dim.label}: ${dim.value}`
      )
      .join(", ");
    parts.push(`Dimensiones: ${dimensionsText}`);
  }

  // Especificaciones
  if (product.specs && product.specs.length > 0) {
    const specsText = product.specs
      .map(
        (spec: { label: string; value: string }) =>
          `${spec.label}: ${spec.value}`
      )
      .join(", ");
    parts.push(`Especificaciones: ${specsText}`);
  }

  // Información de envío
  if (product.shipping_cost !== undefined) {
    parts.push(`Costo de envío: ${product.shipping_cost}`);
  }

  // Variantes (si están disponibles en este punto)
  if (product.variants && product.variants.length > 0) {
    const variantsText = product.variants
      .map((variant: any) => {
        const optionsText = variant.options
          .map(
            (option: any) =>
              `${option.name} (${option.price} ${option.stock !== null ? `- Stock: ${option.stock}` : ""})`
          )
          .join(", ");
        return `${variant.name}: ${optionsText}`;
      })
      .join("; ");
    parts.push(`Variantes: ${variantsText}`);
  } else if (product.single_price !== undefined) {
    // Para productos sin variantes
    parts.push(`Precio: ${product.single_price}`);
    if (product.single_stock !== undefined && product.single_stock !== null) {
      parts.push(`Stock: ${product.single_stock}`);
    }
    if (product.single_sku) {
      parts.push(`SKU: ${product.single_sku}`);
    }
  }

  // Unir todas las partes con saltos de línea
  return parts.join("\n");
}
