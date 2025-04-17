import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Estas variables de entorno deben estar configuradas en tu proyecto
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_SCOPES =
  "read_products,write_products,read_orders,read_inventory";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { businessId } = await request.json();

    // Verificar que el usuario tenga acceso a este negocio
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Verificar que el negocio exista y pertenezca al usuario
    const { data: business } = await supabase
      .from("provider_business")
      .select("id")
      .eq("id", businessId)
      .single();

    if (!business) {
      return NextResponse.json(
        { message: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    // Generar un estado aleatorio para prevenir ataques CSRF
    const state = crypto.randomBytes(16).toString("hex");

    // Guardar el estado en la base de datos para verificarlo después
    const { error } = await supabase.from("shopify_auth_states").insert({
      business_id: businessId,
      state,
      user_id: session.session.user.id,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error al guardar el estado:", error);
      return NextResponse.json(
        { message: "Error al iniciar la autenticación" },
        { status: 500 }
      );
    }

    // Construir la URL de autorización de Shopify
    // Nota: Usamos el dominio de Shopify para iniciar el flujo de OAuth
    const redirectUri = `${APP_URL}/api/integrations/shopify/callback`;
    const authUrl = `https://admin.shopify.com/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error al generar URL de autenticación:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
