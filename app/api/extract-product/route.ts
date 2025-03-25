import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { ZodError } from "zod";
import { ProductSchema } from "@/lib/product-schema";
import {
  transformProductData,
  transformVariants,
} from "@/lib/services/product-transformer";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes("cimaco.com.mx")) {
      return NextResponse.json(
        { message: "URL inválida. Debe ser de cimaco.com.mx" },
        { status: 400 }
      );
    }

    // Obtener el HTML de la página
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Error al obtener la página del producto" },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Usar AI SDK para analizar el HTML y extraer la información del producto
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `
        Eres un experto en web scraping. Analiza el siguiente HTML de una página de producto de Cimaco y extrae la información relevante.
        Devuelve SOLO un objeto JSON con los siguientes campos:
        - name: nombre del producto
        - description: descripción del producto
        - price: precio actual (solo el número, sin símbolos)
        - original_price: precio original si hay descuento (opcional)
        - sku: código SKU del producto (generalmente está en la URL como último segmento)
        - brand: marca del producto (opcional)
        - category: categoría principal (opcional)
        - subcategory: subcategoría (opcional)
        - images: array de URLs de imágenes del producto
        - attributes: objeto con pares clave-valor de atributos del producto
        - variants: array de objetos con {name, options} para variantes como tallas, colores, etc. (opcional)
        - stock: cantidad en stock si está disponible (opcional)
        - url: la URL original del producto
        - extracted_at: timestamp actual en formato ISO

        URL del producto: ${url}
        
        HTML:
        ${html.substring(
          0,
          100000
        )} // Limitar el tamaño para evitar exceder el límite de tokens
      `,
      temperature: 0.1, // Baja temperatura para respuestas más deterministas
      maxTokens: 2000,
    });

    try {
      // Intentar parsear el JSON devuelto por la IA
      const jsonStartIndex = text.indexOf("{");
      const jsonEndIndex = text.lastIndexOf("}") + 1;
      const jsonText = text.substring(jsonStartIndex, jsonEndIndex);

      const productData = JSON.parse(jsonText);

      // Validar con Zod
      const validatedProduct = ProductSchema.parse({
        ...productData,
        extracted_at: productData.extracted_at || new Date().toISOString(),
      });

      // Transformar los datos al formato requerido
      const transformedProduct = transformProductData(validatedProduct);
      const transformedVariants = transformVariants(validatedProduct);

      return NextResponse.json({
        rawProduct: validatedProduct,
        product: transformedProduct,
        variants: transformedVariants,
      });
    } catch (error) {
      console.error("Error parsing AI response:", error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            message: "Error en la validación de datos",
            errors: error.errors,
          },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { message: "Error al procesar la respuesta de la IA" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error extracting product data:", error);
    return NextResponse.json(
      { message: "Error al procesar la información del producto" },
      { status: 500 }
    );
  }
}
