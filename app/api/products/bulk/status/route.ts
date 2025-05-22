import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { productIds, status, businessId } = await request.json();

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de IDs de productos" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Se requiere un estado válido" },
        { status: 400 }
      );
    }

    if (!businessId) {
      return NextResponse.json(
        { error: "Se requiere un ID de negocio" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["draft", "active", "archived", "deleted"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    // Update products status
    const { error } = await supabase
      .from("products")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds)
      .eq("provider_business_id", businessId)
      .neq("status", "requires_verification"); // Skip products in review

    if (error) {
      console.error("Error updating products status:", error);
      return NextResponse.json(
        { error: "Error al actualizar el estado de los productos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Estado de productos actualizado correctamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in bulk status update:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
