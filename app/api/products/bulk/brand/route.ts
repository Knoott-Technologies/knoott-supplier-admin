import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { productIds, brandId, businessId } = await request.json();

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de productos" },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { error: "Se requiere un ID de marca" },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Se requiere un ID de negocio" },
        { status: 400 }
      );
    }

    // Verify brand exists
    const { data: brandData, error: brandError } = await supabase
      .from("catalog_brands")
      .select("id")
      .eq("id", brandId)
      .single();

    if (brandError || !brandData) {
      return NextResponse.json(
        { error: "La marca especificada no existe" },
        { status: 400 }
      );
    }

    // Update products brand
    const { error } = await supabase
      .from("products")
      .update({
        brand_id: brandId,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds)
      .eq("provider_business_id", businessId)
      .neq("status", "requires_verification")
      .neq("status", "deleted"); // Skip products in review or deleted

    if (error) {
      console.error("Error updating products brand:", error);
      return NextResponse.json(
        { error: "Error al actualizar la marca de los productos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Marca de productos actualizada correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk brand update:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
