import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const { variants } = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

    // If no variants, return success
    if (!variants || variants.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Process each variant
    for (const variant of variants) {
      // Insert the variant
      const { data: variantData, error: variantError } = await supabase
        .from("products_variants")
        .insert({
          product_id: Number.parseInt(productId),
          name: variant.name,
          display_name: variant.display_name,
          position: 0, // Default position
        })
        .select()
        .single();

      if (variantError) {
        console.error("Error creating variant:", variantError);
        return NextResponse.json(
          { error: variantError.message },
          { status: 500 }
        );
      }

      // Process each option for this variant
      for (const [index, option] of variant.options.entries()) {
        // Insert the option
        const { error: optionError } = await supabase
          .from("products_variant_options")
          .insert({
            variant_id: variantData.id,
            name: option.name,
            display_name: option.display_name || option.name, // Aseguramos que display_name tenga un valor
            price: option.price || null,
            accorded_commision:
              option.accorded_commision || option.accorded_commission || 0.085, // Corregimos el nombre del campo y valor por defecto
            stock: option.stock || null,
            position: index,
            is_default: option.is_default || false,
            metadata: option.metadata || null,
            sku: option.sku || null,
            images_url: option.images_url || [], // Aseguramos que sea un array vacío en lugar de null
          });

        if (optionError) {
          console.error("Error creating option:", optionError);
          return NextResponse.json(
            { error: optionError.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { variants } = await request.json();
    const productId = params.productId;

    // Create Supabase client
    const supabase = createClient(cookies());

    // First, get existing variants for this product
    const { data: existingVariants, error: fetchError } = await supabase
      .from("products_variants") // Corregimos el nombre de la tabla
      .select("*")
      .eq("product_id", productId);

    if (fetchError) {
      console.error("Error fetching existing variants:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Get existing variant options
    const { data: existingOptions, error: fetchOptionsError } = await supabase
      .from("products_variant_options") // Corregimos el nombre de la tabla
      .select("*")
      .in("variant_id", existingVariants?.map((v) => v.id) || []);

    if (fetchOptionsError) {
      console.error("Error fetching existing options:", fetchOptionsError);
      return NextResponse.json(
        { error: fetchOptionsError.message },
        { status: 500 }
      );
    }

    // Delete existing options first
    if (existingVariants && existingVariants.length > 0) {
      const variantIds = existingVariants.map((v) => v.id);

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

      // Then delete variants
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

    // Insert new variants
    const variantPromises = variants.map(
      async (variant: any, index: number) => {
        const { data: newVariant, error: insertVariantError } = await supabase
          .from("products_variants") // Corregimos el nombre de la tabla
          .insert({
            product_id: productId,
            name: variant.name,
            display_name: variant.display_name,
            position: index,
          })
          .select()
          .single();

        if (insertVariantError) {
          console.error("Error inserting variant:", insertVariantError);
          throw insertVariantError;
        }

        // Insert options for this variant
        const optionPromises = variant.options.map(
          async (option: any, optionIndex: number) => {
            const { error: insertOptionError } = await supabase
              .from("products_variant_options") // Corregimos el nombre de la tabla
              .insert({
                variant_id: newVariant.id,
                name: option.name,
                display_name: option.display_name || option.name,
                price: option.price,
                accorded_commision:
                  option.accorded_commision ||
                  option.accorded_commission ||
                  0.085, // Corregimos el nombre del campo
                stock: option.stock,
                is_default: option.is_default,
                sku: option.sku || "",
                images_url: option.images_url || [],
                metadata: option.metadata || null,
                position: optionIndex,
              });

            if (insertOptionError) {
              console.error("Error inserting option:", insertOptionError);
              throw insertOptionError;
            }
          }
        );

        await Promise.all(optionPromises);
        return newVariant;
      }
    );

    const results = await Promise.all(variantPromises);
    return NextResponse.json(results);
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

    // Get variants for this product
    const { data: variants, error: variantsError } = await supabase
      .from("products_variants") // Corregimos el nombre de la tabla
      .select("*")
      .eq("product_id", productId)
      .order("position");

    if (variantsError) {
      console.error("Error fetching variants:", variantsError);
      return NextResponse.json(
        { error: variantsError.message },
        { status: 500 }
      );
    }

    // Get options for these variants
    const variantIds = variants.map((v) => v.id);

    // Si no hay variantes, devolver un array vacío
    if (variantIds.length === 0) {
      return NextResponse.json([]);
    }

    const { data: options, error: optionsError } = await supabase
      .from("products_variant_options") // Corregimos el nombre de la tabla
      .select("*")
      .in("variant_id", variantIds)
      .order("position");

    if (optionsError) {
      console.error("Error fetching options:", optionsError);
      return NextResponse.json(
        { error: optionsError.message },
        { status: 500 }
      );
    }

    // Organize options by variant
    const variantsWithOptions = variants.map((variant) => {
      const variantOptions = options.filter(
        (option) => option.variant_id === variant.id
      );
      return {
        ...variant,
        options: variantOptions,
      };
    });

    return NextResponse.json(variantsWithOptions);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
