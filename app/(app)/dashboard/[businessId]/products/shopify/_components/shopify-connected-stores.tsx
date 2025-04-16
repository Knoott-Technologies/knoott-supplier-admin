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

interface ShopifyIntegration {
  id: string;
  shop_domain: string;
  shop_name: string | null;
  status: string;
  last_synced: string | null;
  product_count: number;
  connected_at: string | null;
}

interface ShopifyConnectedStoresProps {
  integrations: ShopifyIntegration[];
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
    <div className="grid gap-4 md:grid-cols-2">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {integration.shop_name || integration.shop_domain}
              </CardTitle>
              <Badge
                variant={
                  integration.status === "active" ? "default" : "destructive"
                }
              >
                {integration.status === "active"
                  ? "Activa"
                  : integration.status === "expired"
                  ? "Expirada"
                  : "Pendiente"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dominio:</span>
                <span>{integration.shop_domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Productos:</span>
                <span>{integration.product_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Última sincronización:
                </span>
                <span>
                  {integration.last_synced
                    ? new Date(integration.last_synced).toLocaleString()
                    : "Nunca"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conectada el:</span>
                <span>
                  {integration.connected_at
                    ? new Date(integration.connected_at).toLocaleString()
                    : "Pendiente"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
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
