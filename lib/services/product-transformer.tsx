import { Product } from "../product-schema";
import { ProductFormValues } from "../schemas";

export function transformProductData(product: Product): ProductFormValues {
  // Extraer palabras clave de la descripción y categorías
  const keywords = extractKeywords(product);

  // Extraer dimensiones y especificaciones de los atributos
  const { dimensions, specs } = extractSpecifications(product.attributes);

  // Transformar al formato requerido
  return {
    // Información general
    name: product.name,
    short_name:
      product.name.length > 30 ? product.name.substring(0, 30) : product.name,
    description: product.description || product.name,
    short_description: product.description
      ? product.description.length > 100
        ? product.description.substring(0, 100) + "..."
        : product.description
      : product.name,

    // Imágenes
    images_url: product.images,

    // Categorización - Usamos valores temporales que deberán ser mapeados
    // a IDs reales en tu sistema
    brand_id: product.brand ? 1 : null, // Valor temporal
    subcategory_id: 1, // Valor temporal

    // Especificaciones
    dimensions,
    specs,
    keywords,
  };
}

// Función para extraer palabras clave de la descripción y categorías
function extractKeywords(product: Product): string[] {
  const keywords: Set<string> = new Set();

  // Añadir marca si existe
  if (product.brand) {
    keywords.add(product.brand);
  }

  // Añadir categoría y subcategoría si existen
  if (product.category) {
    keywords.add(product.category);
  }
  if (product.subcategory) {
    keywords.add(product.subcategory);
  }

  // Extraer palabras clave de la descripción
  if (product.description) {
    // Eliminar palabras comunes y quedarse con palabras relevantes
    const words = product.description
      .toLowerCase()
      .replace(/[^\w\sáéíóúüñ]/g, "")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 3 &&
          ![
            "para",
            "como",
            "este",
            "esta",
            "estos",
            "estas",
            "desde",
            "hasta",
            "entre",
            "pero",
            "porque",
          ].includes(word)
      );

    // Añadir palabras únicas
    words.forEach((word) => keywords.add(word));
  }

  // Convertir a array y limitar a 20 palabras clave
  return Array.from(keywords).slice(0, 20);
}

// Función para extraer dimensiones y especificaciones de los atributos
function extractSpecifications(attributes: Record<string, string>) {
  const dimensions: { label: string; value: string }[] = [];
  const specs: { label: string; value: string }[] = [];

  // Procesar cada atributo
  Object.entries(attributes).forEach(([key, value]) => {
    // Verificar si es una dimensión
    if (
      key.toLowerCase().includes("dimension") ||
      key.toLowerCase().includes("medida") ||
      key.toLowerCase().includes("tamaño") ||
      key.toLowerCase().includes("alto") ||
      key.toLowerCase().includes("ancho") ||
      key.toLowerCase().includes("largo") ||
      key.toLowerCase().includes("profundidad")
    ) {
      dimensions.push({ label: key, value });
    } else {
      // Si no es dimensión, es una especificación general
      specs.push({ label: key, value });
    }
  });

  return { dimensions, specs };
}

// Función para transformar variantes si están disponibles
export function transformVariants(product: Product) {
  if (!product.variants || product.variants.length === 0) {
    return { variants: [] };
  }

  return {
    variants: product.variants.map((variant) => ({
      name: variant.name.toLowerCase().replace(/\s+/g, "_"),
      display_name: variant.name,
      options: variant.options.map((option, index) => ({
        name: option.toLowerCase().replace(/\s+/g, "_"),
        display_name: option,
        price: null,
        stock: product.stock || null,
        is_default: index === 0, // Primera opción como predeterminada
        sku: null,
        images_url: product.images,
        metadata: null,
      })),
    })),
  };
}
