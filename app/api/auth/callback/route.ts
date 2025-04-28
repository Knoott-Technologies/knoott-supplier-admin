import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
  // Obtener la URL completa y extraer los parámetros
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("tokenHash");
  const businessId = requestUrl.searchParams.get("businessId");
  const invitationToken = requestUrl.searchParams.get("token");

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
        {
          phone: phoneNumber,
          phone_confirm: true,
        }
      );
    }

    // Verificar si el usuario ya existe en la tabla de usuarios
    const { data: existingUser, error: existingUserError } = await admin
      .from("users")
      .select("id")
      .eq("id", verifyData.user.id)
      .single();

    // Determinar si debemos insertar basándonos en el código de error específico
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

    // Si hay businessId y invitationToken, procesar la invitación
    if (businessId && invitationToken) {
      try {
        // 1. Verificar si existe una invitación pendiente
        const { data: invitation, error: invitationError } = await admin
          .from("business_invitations")
          .select("id, role")
          .eq("business_id", businessId)
          .eq("invitation_token", invitationToken)
          .eq("status", "pending")
          .single();

        if (invitationError) {
          if (invitationError.code !== "PGRST116") {
            console.error("Error al verificar invitación:", invitationError);
          }
        } else if (invitation) {
          // 2. Verificar si ya existe una relación provider_business_users
          const { data: existingRelation, error: relationCheckError } =
            await admin
              .from("provider_business_users")
              .select("id")
              .eq("user_id", verifyData.user.id)
              .eq("business_id", businessId)
              .maybeSingle();

          if (
            !existingRelation &&
            (!relationCheckError || relationCheckError.code === "PGRST116")
          ) {
            // 3. Crear la relación provider_business_users con el rol especificado en la invitación
            const { error: userBusinessError } = await admin
              .from("provider_business_users")
              .insert({
                user_id: verifyData.user.id,
                business_id: businessId,
                role: invitation.role,
              });

            if (!userBusinessError) {
              // 4. Actualizar el estado de la invitación a 'accepted'
              await admin
                .from("business_invitations")
                .update({
                  status: "accepted",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", invitation.id);

              // 5. Redirigir al dashboard del negocio
              return NextResponse.redirect(
                new URL(`/dashboard/${businessId}`, request.url)
              );
            }
          } else if (existingRelation) {
            // Si ya existe la relación, igual redirigir al dashboard del negocio
            return NextResponse.redirect(
              new URL(`/dashboard/${businessId}`, request.url)
            );
          }
        }
      } catch (inviteError) {
        console.error("Error al procesar invitación de negocio:", inviteError);
        // Si hay error, continuar con el flujo normal sin invitación
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
