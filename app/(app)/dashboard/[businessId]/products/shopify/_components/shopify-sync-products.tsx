"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/universal/logo";
import { Database } from "@/database.types";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { IntegrationAnimation } from "./integration-animation";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const ShopifySyncProducts = ({
  data,
  businessId,
}: {
  data: Database["public"]["Tables"]["shopify_integrations"]["Row"];
  businessId: string;
}) => {
  const router = useRouter();

  const [syncingStore, setSyncingStore] = useState<boolean>(false);
  const handleSync = async (integrationId: string) => {
    setSyncingStore(true);

    try {
      const response = await fetch(
        `/api/integrations/shopify/${integrationId}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al sincronizar productos");
      }

      // Mostrar mensaje de éxito con detalles
      toast.success("Productos sincronizados correctamente", {
        description: `Se han sincronizado ${data.stats.totalProducts} productos (${data.stats.created} nuevos, ${data.stats.updated} actualizados, ${data.stats.errors} errores)`,
      });

      // Recargar la página para mostrar los productos actualizados
      router.refresh();
    } catch (error) {
      console.error("Error al sincronizar productos:", error);
      toast.error("Error al sincronizar productos", {
        description:
          error instanceof Error ? error.message : "Por favor intenta de nuevo",
      });
    } finally {
      setSyncingStore(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincroniza tus productos de Shopify</CardTitle>
        <CardDescription>
          Sincroniza tus productos de Shopify con tu tienda de Shopify, no
          tendrás que hacer esto siempre, nosotros nos encargaremos de
          sincronizar cuuando actualices, agregues o elimines un producto en tu
          tienda de Shopify.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar p-0">
        <div className="flex items-center justify-center gap-x-0">
          <IntegrationAnimation
            isSyncronized={
              data.last_synced && data.product_count && data.product_count > 0
                ? true
                : false
            }
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t">
        {data.last_synced ? (
          <p className="text-xs text-muted-foreground">
            Última sincronización:{" "}
            {formatInTimeZone(
              data.last_synced,
              timeZone,
              "PPP 'a las' hh:mm a",
              { locale: es }
            )}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            No se han sincronizado productos
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSync(data.id)}
          disabled={syncingStore}
          className="bg-sidebar"
        >
          {syncingStore ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sincronizar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
