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
            display_name: option.display_name,
            price: option.price || null,
            accorded_commision: option.accorded_commision || 0,
            stock: option.stock || null,
            position: index,
            is_default: option.is_default || false,
            metadata: option.metadata || null,
            sku: option.sku || null,
            images_url: option.images_url || null,
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
