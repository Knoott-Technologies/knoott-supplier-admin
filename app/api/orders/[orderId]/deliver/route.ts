import { createAdminClient } from "@/utils/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId, branchId } = await req.json();

    if (!userId || !branchId) {
      return NextResponse.json(
        { error: "Se requiere ID de usuario y sucursal" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verificar que la orden existe y pertenece a la sucursal
    const { data: order, error: orderError } = await supabase
      .from("wedding_product_orders")
      .select("*")
      .eq("id", params.orderId)
      .eq("provider_branch_id", branchId)
      .eq("status", "shipped")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Orden no encontrada o no puede ser marcada como entregada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario tiene permisos en esta sucursal
    const { data: userBranch, error: userBranchError } = await supabase
      .from("user_provider_branches")
      .select("*")
      .eq("user_id", userId)
      .eq("provider_id", branchId)
      .single();

    if (userBranchError || !userBranch) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar esta orden" },
        { status: 403 }
      );
    }

    // Actualizar la orden
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("wedding_product_orders")
      .update({
        status: "delivered",
        delivered_at: now,
      })
      .eq("id", params.orderId);

    if (updateError) {
      console.error("Error al actualizar la orden:", updateError);
      return NextResponse.json(
        { error: "Error al marcar la orden como entregada" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Orden marcada como entregada correctamente",
    });
  } catch (error) {
    console.error("Error en la API de entrega:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
