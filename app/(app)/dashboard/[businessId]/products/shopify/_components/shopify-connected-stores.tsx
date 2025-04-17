"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Database } from "@/database.types";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface ShopifyConnectedStoresProps {
  integrations: Database["public"]["Tables"]["shopify_integrations"]["Row"][];
  businessId: string;
}

export const ShopifyConnectedStores = ({
  integrations,
  businessId,
}: ShopifyConnectedStoresProps) => {
  const [syncingStores, setSyncingStores] = useState<Record<string, boolean>>(
    {}
  );
  const [disconnectingStores, setDisconnectingStores] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  const handleSync = async (integrationId: string) => {
    setSyncingStores((prev) => ({ ...prev, [integrationId]: true }));
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
      setSyncingStores((prev) => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setDisconnectingStores((prev) => ({ ...prev, [integrationId]: true }));
    try {
      const response = await fetch(
        `/api/integrations/shopify/${integrationId}/disconnect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessId }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al desconectar tienda");
      }

      toast.success("Tienda desconectada correctamente");

      // Recargar la página para actualizar la lista de tiendas
      router.refresh();
    } catch (error) {
      console.error("Error al desconectar tienda:", error);
      toast.error("Error al desconectar tienda", {
        description:
          error instanceof Error ? error.message : "Por favor intenta de nuevo",
      });
    } finally {
      setDisconnectingStores((prev) => ({ ...prev, [integrationId]: false }));
    }
  };

  return (
    <div className="grid gap-4 w-full">
      {integrations.map((integration) => (
        <Card className="w-full" key={integration.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {integration.shop_name || integration.shop_domain}
              </CardTitle>
              <Badge
                variant={
                  integration.status === "active" ? "outline" : "destructive"
                }
                className={cn(
                  integration.status === "active" &&
                    "bg-success/20 text-success hover:bg-success/20 border-transparent"
                )}
              >
                {integration.status === "active"
                  ? "Activa"
                  : integration.status === "expired"
                  ? "Expirada"
                  : "Pendiente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="bg-sidebar">
            <Table className="border bg-background">
              <TableBody>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                  <TableCell className="bg-muted/50 py-2 font-medium">
                    Dominio
                  </TableCell>
                  <TableCell className="py-2">
                    {integration.shop_domain}
                  </TableCell>
                </TableRow>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                  <TableCell className="bg-muted/50 py-2 font-medium">
                    Productos
                  </TableCell>
                  <TableCell className="py-2">
                    {integration.product_count}
                  </TableCell>
                </TableRow>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                  <TableCell className="bg-muted/50 py-2 font-medium">
                    Última sincronización
                  </TableCell>
                  <TableCell className="py-2">
                    {integration.last_synced
                      ? formatInTimeZone(
                          new Date(integration.last_synced),
                          timeZone,
                          "PPP 'a las' hh:mm:ss a",
                          {
                            locale: es,
                          }
                        )
                      : "Nunca"}
                  </TableCell>
                </TableRow>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                  <TableCell className="bg-muted/50 py-2 font-medium">
                    Conectada el
                  </TableCell>
                  <TableCell className="py-2">
                    {integration.connected_at
                      ? formatInTimeZone(
                          new Date(integration.connected_at),
                          timeZone,
                          "PPP 'a las' hh:mm:ss a",
                          {
                            locale: es,
                          }
                        )
                      : "Pendiente"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSync(integration.id)}
              disabled={
                syncingStores[integration.id] || integration.status !== "active"
              }
            >
              {syncingStores[integration.id] ? (
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={disconnectingStores[integration.id]}
                >
                  {disconnectingStores[integration.id] ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    <>
                      Desconectar
                      <Trash2 className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción desconectará tu tienda Shopify de la plataforma.
                    Los productos ya sincronizados permanecerán, pero no se
                    actualizarán automáticamente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-background"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    Desconectar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
