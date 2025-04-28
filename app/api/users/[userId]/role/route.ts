import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
// Ruta para actualizar el rol de un usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const supabase = createClient(cookies());
  const userId = params.userId;

  // Obtener el nuevo rol del cuerpo de la solicitud
  const { role } = await request.json();

  // Validar el rol
  if (!["admin", "supervisor", "staff"].includes(role)) {
    return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
  }

  // Obtener el business_id de los parámetros de consulta
  const searchParams = request.nextUrl.searchParams;
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { error: "Se requiere el ID del negocio" },
      { status: 400 }
    );
  }

  // Actualizar el rol del usuario
  const { data, error } = await supabase
    .from("provider_business_users")
    .update({ role })
    .eq("user_id", userId)
    .eq("business_id", businessId)

  if (error) {
    return NextResponse.json(
      { error: "Error al actualizar el rol del usuario" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
