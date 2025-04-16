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
import { Database } from "@/database.types";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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

      if (!response.ok) {
        throw new Error("Error al sincronizar productos");
      }

      // Recargar la página para mostrar los productos actualizados
      window.location.reload();
    } catch (error) {
      console.error("Error al sincronizar productos:", error);
      alert("Error al sincronizar productos. Por favor intenta de nuevo.");
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
        throw new Error("Error al desconectar tienda");
      }

      // Recargar la página para actualizar la lista de tiendas
      window.location.reload();
    } catch (error) {
      console.error("Error al desconectar tienda:", error);
      alert("Error al desconectar tienda. Por favor intenta de nuevo.");
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
                      ? new Date(integration.last_synced).toLocaleString()
                      : "Nunca"}
                  </TableCell>
                </TableRow>
                <TableRow className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
                  <TableCell className="bg-muted/50 py-2 font-medium">
                    Conectada el
                  </TableCell>
                  <TableCell className="py-2">
                    {integration.connected_at
                      ? new Date(integration.connected_at).toLocaleString()
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Desconectar
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
                  <AlertDialogAction
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
