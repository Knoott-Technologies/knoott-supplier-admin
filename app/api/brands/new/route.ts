import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, status } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la marca es requerido" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(cookies());

    // Check if brand already exists
    const { data: existingBrand, error: checkError } = await supabase
      .from("catalog_brands")
      .select("*")
      .eq("name", name)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing brand:", checkError);
      return NextResponse.json(
        { error: "Error al verificar si la marca ya existe" },
        { status: 500 }
      );
    }

    if (existingBrand) {
      return NextResponse.json(
        { error: "Ya existe una marca con ese nombre" },
        { status: 409 }
      );
    }

    // Insert the brand into the database
    const { data, error } = await supabase
      .from("catalog_brands")
      .insert({
        name,
        status: status || "on_revision",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating brand:", error);
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
