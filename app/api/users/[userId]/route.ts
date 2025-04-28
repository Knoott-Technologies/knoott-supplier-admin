import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Ruta para eliminar un usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient(cookies());
  const userId = params.userId;

  // Obtener el business_id de los parámetros de consulta
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { error: "Se requiere el ID del negocio" },
      { status: 400 }
    );
  }

  // Eliminar la relación usuario-negocio
  const { error } = await supabase
    .from("provider_business_users")
    .delete()
    .eq("user_id", userId)
    .eq("business_id", businessId);

  console.log(error);

  if (error) {
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
