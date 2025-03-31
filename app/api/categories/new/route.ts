import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, parent_id, status } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(cookies());

    // If parent_id is provided, check if it exists
    if (parent_id) {
      const { data: parentCategory, error: parentError } = await supabase
        .from("catalog_collections")
        .select("*")
        .eq("id", parent_id)
        .single();

      if (parentError) {
        console.error("Error checking parent category:", parentError);
        return NextResponse.json(
          { error: "La categoría padre no existe" },
          { status: 404 }
        );
      }
    }

    // Check if category already exists with the same name and parent
    const query = supabase
      .from("catalog_collections")
      .select("*")
      .eq("name", name);

    if (parent_id) {
      query.eq("parent_id", parent_id);
    } else {
      query.is("parent_id", null);
    }

    const { data: existingCategory, error: checkError } =
      await query.maybeSingle();

    if (checkError) {
      console.error("Error checking existing category:", checkError);
      return NextResponse.json(
        { error: "Error al verificar si la categoría ya existe" },
        { status: 500 }
      );
    }

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre en el mismo nivel" },
        { status: 409 }
      );
    }

    // Insert the category into the database
    const { data, error } = await supabase
      .from("catalog_collections")
      .insert({
        name,
        parent_id: parent_id || null,
        status: status || "on_revision",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
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
