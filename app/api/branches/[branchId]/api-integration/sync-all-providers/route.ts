import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Esta ruta puede ser llamada por un cronjob para sincronizar todos los proveedores configurados
// Ejemplo: https://tu-dominio.com/api/cron/sync-all-providers?secret=tu_clave_secreta

export async function GET(request: Request) {
  try {
    // Verificar clave secreta para seguridad
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(cookies());

    // Obtener todas las integraciones de API con sincronización automática habilitada
    const { data: integrations, error: integrationError } = await supabase
      .from("api_integrations")
      .select("id, provider_branch_id, provider, sync_frequency, last_sync_at")
      .eq("auto_sync", true);

    if (integrationError) {
      console.error("Error fetching API integrations:", integrationError);
      return NextResponse.json(
        { error: integrationError.message },
        { status: 500 }
      );
    }

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({
        message: "No integrations configured for auto-sync",
      });
    }

    const now = new Date();
    const results = [];

    // Verificar cada integración para ver si necesita sincronización
    for (const integration of integrations) {
      let shouldSync = false;

      // Determinar si es hora de sincronizar según la frecuencia configurada
      if (!integration.last_sync_at) {
        shouldSync = true;
      } else {
        const lastSync = new Date(integration.last_sync_at);
        const hoursSinceLastSync =
          (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

        switch (integration.sync_frequency) {
          case "hourly":
            shouldSync = hoursSinceLastSync >= 1;
            break;
          case "daily":
            shouldSync = hoursSinceLastSync >= 24;
            break;
          case "weekly":
            shouldSync = hoursSinceLastSync >= 168; // 7 * 24
            break;
          default:
            shouldSync = hoursSinceLastSync >= 24; // Default to daily
        }
      }

      if (shouldSync) {
        // Iniciar sincronización para esta integración
        try {
          // Llamar a la API de sincronización para este proveedor
          const syncUrl = `${request.headers.get("origin")}/api/branches/${
            integration.provider_branch_id
          }/api-integration/sync`;

          const syncResponse = await fetch(syncUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Pasar cookies para autenticación
              Cookie: request.headers.get("cookie") || "",
            },
          });

          if (!syncResponse.ok) {
            const errorData = await syncResponse.json();
            results.push({
              branchId: integration.provider_branch_id,
              provider: integration.provider,
              status: "error",
              message: errorData.error || syncResponse.statusText,
            });
          } else {
            const successData = await syncResponse.json();
            results.push({
              branchId: integration.provider_branch_id,
              provider: integration.provider,
              status: "success",
              message: successData.message,
              stats: successData.stats,
            });
          }
        } catch (error) {
          console.error(
            `Error syncing ${integration.provider} for branch ${integration.provider_branch_id}:`,
            error
          );
          results.push({
            branchId: integration.provider_branch_id,
            provider: integration.provider,
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Sync process completed",
      results,
    });
  } catch (error) {
    console.error("Error in sync all providers:", error);
    return NextResponse.json(
      { error: "Error syncing providers" },
      { status: 500 }
    );
  }
}
