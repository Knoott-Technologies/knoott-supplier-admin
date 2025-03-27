import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const admin = createAdminClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener endpoint de la suscripción
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint de suscripción requerido" },
        { status: 400 }
      );
    }

    // Eliminar suscripción de la base de datos
    const { error } = await admin
      .from("push_subscriptions")
      .delete()
      .match({ user_id: user.id, endpoint, app_reference: "suppliers" });

    if (error) {
      console.error("Error al eliminar suscripción:", error);
      return NextResponse.json(
        { error: "Error al eliminar suscripción" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en la API de cancelación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
