import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const supabase = createClient(cookies());

    // Obtener la configuración de API para esta sucursal
    const { data: integration, error: integrationError } = await supabase
      .from("api_integrations")
      .select("*")
      .eq("provider_branch_id", params.branchId)
      .single();

    if (integrationError) {
      return NextResponse.json(
        { error: "API integration not found" },
        { status: 404 }
      );
    }

    // Iniciar sincronización según el proveedor
    let syncResult;

    // Llamar a la ruta de sincronización del cronjob
    // Esto permite reutilizar la misma lógica para sincronizaciones manuales y automáticas
    const response = await fetch(
      `${request.headers.get("origin")}/api/cron/sync-products?branchId=${
        params.branchId
      }&secret=${process.env.CRON_SECRET}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Error al sincronizar productos" },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: result.message,
      stats: result.stats,
    });
  } catch (error) {
    console.error("Error syncing products:", error);
    return NextResponse.json(
      { error: "Error al sincronizar productos" },
      { status: 500 }
    );
  }
}
