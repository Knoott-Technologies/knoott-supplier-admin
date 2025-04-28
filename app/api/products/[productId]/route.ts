import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const supabase = createClient(cookies());

    // Verificar si el producto está en revisión
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("status")
      .eq("id", productId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "Error al obtener el producto" },
        { status: 500 }
      );
    }

    if (product.status === "requires_verification") {
      return NextResponse.json(
        { error: "No se puede eliminar un producto en revisión" },
        { status: 403 }
      );
    }

    // Implementar soft-delete cambiando el status a "deleted"
    const { error } = await supabase
      .from("products")
      .update({
        status: "deleted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar el producto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const product = await request.json();
    const productId = params.productId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // Transform dimensions and specs from array to object format
    const dimensionsObject =
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
        : null;

    const specsObject =
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
        : null;

    // Update the product in the database
    const { data, error } = await supabase
      .from("products")
      .update({
        name: product.name,
        short_name: product.short_name,
        description: product.description,
        short_description: product.short_description,
        brand_id: product.brand_id,
        subcategory_id: product.subcategory_id,
        images_url: product.images_url,
        shipping_cost: product.shipping_cost || 0, // Añadimos el costo de envío
        dimensions: dimensionsObject,
        specs: specsObject,
        keywords: product.keywords || [],
      })
      .eq("id", productId)
      .select();

    if (error) {
      console.error("Error updating product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si el producto no tiene variantes pero tiene datos de producto único,
    // actualizamos o creamos una variante predeterminada
    if (product.single_price !== undefined && !product.hasVariants) {
      // Primero verificamos si ya existe una variante predeterminada
      const { data: existingVariants, error: variantError } = await supabase
        .from("products_variants")
        .select("*")
        .eq("product_id", productId);

      if (variantError) {
        console.error("Error checking existing variants:", variantError);
        return NextResponse.json(
          { error: variantError.message },
          { status: 500 }
        );
      }

      // Si existen variantes, las eliminamos para crear la predeterminada
      if (existingVariants && existingVariants.length > 0) {
        const variantIds = existingVariants.map((v) => v.id);

        // Eliminar opciones de variantes
        const { error: deleteOptionsError } = await supabase
          .from("products_variant_options")
          .delete()
          .in("variant_id", variantIds);

        if (deleteOptionsError) {
          console.error("Error deleting variant options:", deleteOptionsError);
          return NextResponse.json(
            { error: deleteOptionsError.message },
            { status: 500 }
          );
        }

        // Eliminar variantes
        const { error: deleteVariantsError } = await supabase
          .from("products_variants")
          .delete()
          .eq("product_id", productId);

        if (deleteVariantsError) {
          console.error("Error deleting variants:", deleteVariantsError);
          return NextResponse.json(
            { error: deleteVariantsError.message },
            { status: 500 }
          );
        }
      }

      // Crear variante predeterminada
      const { data: defaultVariant, error: createVariantError } = await supabase
        .from("products_variants")
        .insert({
          product_id: productId,
          name: "Default",
          display_name: "Default",
          position: 0,
        })
        .select()
        .single();

      if (createVariantError) {
        console.error("Error creating default variant:", createVariantError);
        return NextResponse.json(
          { error: createVariantError.message },
          { status: 500 }
        );
      }

      // Crear opción predeterminada
      const { error: createOptionError } = await supabase
        .from("products_variant_options")
        .insert({
          variant_id: defaultVariant.id,
          name: "Default",
          display_name: "Default",
          price: product.single_price || 0,
          stock: product.single_stock || null,
          is_default: true,
          sku: product.single_sku || "",
          images_url: product.images_url || [],
          metadata: null,
          accorded_commision: product.single_commission || 0.085,
          position: 0,
        });

      if (createOptionError) {
        console.error("Error creating default option:", createOptionError);
        return NextResponse.json(
          { error: createOptionError.message },
          { status: 500 }
        );
      }
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

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // Get the product from the database
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Verificar si el producto tiene variantes o es un producto simple
    const { data: variants, error: variantsError } = await supabase
      .from("products_variants")
      .select("*")
      .eq("product_id", productId);

    if (variantsError) {
      console.error("Error fetching variants:", variantsError);
      return NextResponse.json(
        { error: variantsError.message },
        { status: 500 }
      );
    }

    // Si hay exactamente una variante con nombre "Default", es un producto sin variantes
    const isSimpleProduct =
      variants.length === 1 &&
      variants[0].name === "Default" &&
      variants[0].display_name === "Default";

    if (isSimpleProduct) {
      // Obtener la opción predeterminada
      const { data: options, error: optionsError } = await supabase
        .from("products_variant_options")
        .select("*")
        .eq("variant_id", variants[0].id)
        .eq("is_default", true)
        .single();

      if (optionsError) {
        console.error("Error fetching default option:", optionsError);
      } else if (options) {
        // Añadir información del producto simple
        product.single_price = options.price;
        product.single_stock = options.stock;
        product.single_sku = options.sku;
        product.single_commission = options.accorded_commision;
        product.hasVariants = false;
      }
    } else {
      product.hasVariants = true;
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
