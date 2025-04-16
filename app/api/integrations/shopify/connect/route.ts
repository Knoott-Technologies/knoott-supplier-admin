import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Estas variables de entorno deben estar configuradas en tu proyecto
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;
const SHOPIFY_SCOPES = "read_products,write_products";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { shopDomain, businessId } = await request.json();

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

    // Verificar si ya existe una integración activa para este negocio y tienda
    const { data: existingIntegration } = await supabase
      .from("shopify_integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("shop_domain", shopDomain)
      .eq("status", "active")
      .single();

    if (existingIntegration) {
      return NextResponse.json(
        { message: "Ya existe una integración activa para esta tienda" },
        { status: 400 }
      );
    }

    // Generar un estado aleatorio para prevenir ataques CSRF
    const state = crypto.randomBytes(16).toString("hex");

    // Construir la URL de autorización de Shopify
    const redirectUri = `${APP_URL}/api/integrations/shopify/callback`;
    console.log(redirectUri);
    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;

    // Guardar la información de conexión pendiente en Supabase
    const { error } = await supabase.from("shopify_integrations").insert({
      business_id: businessId,
      shop_domain: shopDomain,
      state,
      status: "pending",
    });

    if (error) {
      console.error("Error al guardar la conexión:", error);
      return NextResponse.json(
        { message: "Error al iniciar la conexión" },
        { status: 500 }
      );
    }

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error al conectar con Shopify:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
