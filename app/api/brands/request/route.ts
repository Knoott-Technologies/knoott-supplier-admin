import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { name, businessId } = await request.json();

    // Validate input
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Se requiere un nombre válido para la marca" },
        { status: 400 }
      );
    }

    // Check if a brand with this name already exists
    const { data: existingBrands, error: searchError } = await supabase
      .from("catalog_brands")
      .select("id, name")
      .ilike("name", name.trim());

    if (searchError) {
      console.error("Error searching for existing brands:", searchError);
      return NextResponse.json(
        { error: "Error al verificar marcas existentes" },
        { status: 500 }
      );
    }

    if (existingBrands && existingBrands.length > 0) {
      return NextResponse.json(
        {
          error: `Ya existe una marca con un nombre similar: "${existingBrands[0].name}"`,
        },
        { status: 400 }
      );
    }

    // Insert new brand with on_revision status
    const { data, error } = await supabase
      .from("catalog_brands")
      .insert({
        name: name.trim(),
        status: "on_revision",
      })
      .select();

    if (error) {
      console.error("Error creating brand request:", error);
      return NextResponse.json(
        { error: "Error al crear la solicitud de marca" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Solicitud de marca creada correctamente",
        brand: data?.[0] || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in brand request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
