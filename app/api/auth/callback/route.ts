// app/api/auth/callback/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  // Obtener la URL completa y extraer los parámetros
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("tokenHash");

  // Si no hay token, redirigir a la página de inicio de sesión
  if (!tokenHash) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Crear cliente de Supabase
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const admin = createAdminClient();

    // Verificar el token OTP
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "signup",
      });

    if (verifyError || !verifyData.user) {
      return NextResponse.redirect(
        new URL("/register?error=verification_failed", request.url)
      );
    }

    // Obtener el teléfono desde los metadatos del usuario
    const phoneNumber = verifyData.user.user_metadata?.phone;

    if (phoneNumber) {
      // Actualizar el teléfono en la información del usuario
      const { error: updateError } = await admin.auth.admin.updateUserById(
        verifyData.user.id,
        { phone: phoneNumber, phone_confirm: true }
      );
    }

    // Verificar si el usuario ya existe en la tabla de usuarios
    const { data: existingUser, error: existingUserError } = await admin
      .from("users")
      .select("id")
      .eq("id", verifyData.user.id)
      .single();

    // CORRECCIÓN: Determinar si debemos insertar basándonos en el código de error específico
    // El error PGRST116 significa que no se encontró ninguna fila, lo que indica que debemos insertar
    const userNotFound = existingUserError?.code === "PGRST116";
    const shouldInsert = !existingUser && userNotFound;

    // Si no existe, insertar el usuario en la tabla users

    if (shouldInsert) {
      const userData = {
        id: verifyData.user.id,
        first_name: verifyData.user.user_metadata?.first_name || "",
        last_name: verifyData.user.user_metadata?.last_name || "",
        email: verifyData.user.email || "",
        phone_number: phoneNumber || "",
      };

      const { data: insertData, error: insertError } = await admin
        .from("users")
        .insert(userData)
        .select();

      const { error: notificationError } = await admin
        .from("user_preferences")
        .insert({
          user_id: verifyData.user.id,
          email_notifications: true,
          email_marketing: true,
        });

      if (insertError || notificationError) {
        return NextResponse.redirect(
          new URL("/register?error=db_error", request.url)
        );
      }
    }

    // Si no hay invitación o hubo un error, redirigir a la página de onboarding
    return NextResponse.redirect(new URL("/onboarding", request.url));
  } catch (error) {
    console.error("Error en callback de autenticación:", error);
    return NextResponse.redirect(
      new URL("/register?error=unknown", request.url)
    );
  }
}
