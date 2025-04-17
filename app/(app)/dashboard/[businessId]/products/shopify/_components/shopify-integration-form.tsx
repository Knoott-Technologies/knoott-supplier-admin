"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shopify } from "@/components/svgs/icons";

export const ShopifyIntegrationForm = ({
  businessId,
}: {
  businessId: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectShopify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Iniciar el proceso de OAuth con Shopify
      const response = await fetch("/api/integrations/shopify/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al conectar con Shopify");
      }

      // Redirigir al usuario a la página de autorización de Shopify
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al conectar con Shopify"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Conectar tienda Shopify</CardTitle>
        <CardDescription>
          Conecta tu tienda Shopify para sincronizar productos automáticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <Shopify className="size-16 text-[#95BF47]" />
          <p className="text-center text-sm text-muted-foreground max-w-md">
            Al conectar tu tienda Shopify, podrás sincronizar automáticamente
            tus productos y mantener actualizado tu inventario entre ambas
            plataformas.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm text-muted-foreground border-t gap-y-2">
        <Button
          onClick={handleConnectShopify}
          disabled={isLoading}
          variant={"defaultBlack"}
          size={"sm"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              Conectar con Shopify
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
