import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const product = await request.json();

    // Create Supabase client
    const supabase = createClient(cookies());

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
        provider_branch_id: product.provider_branch_id,
        images_url: product.images_url,
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
