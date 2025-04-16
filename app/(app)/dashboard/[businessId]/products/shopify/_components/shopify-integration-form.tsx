"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Shopify } from "@/components/svgs/icons";

// Definir el esquema de validación con Zod
const shopifyFormSchema = z.object({
  shopDomain: z
    .string()
    .min(1, "El dominio de la tienda es requerido")
    .refine(
      (value) => {
        // Validar formato básico de dominio
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
        const domain = value.replace(".myshopify.com", "");
        return domainRegex.test(domain);
      },
      {
        message: "Formato de dominio inválido",
      }
    ),
});

type ShopifyFormValues = z.infer<typeof shopifyFormSchema>;

export const ShopifyIntegrationForm = ({
  businessId,
}: {
  businessId: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm<ShopifyFormValues>({
    resolver: zodResolver(shopifyFormSchema),
    defaultValues: {
      shopDomain: "",
    },
  });

  const onSubmit = async (values: ShopifyFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Formatear el dominio para asegurar que tenga el formato correcto
      let formattedDomain = values.shopDomain.trim();
      if (!formattedDomain.includes(".myshopify.com")) {
        formattedDomain = formattedDomain + ".myshopify.com";
      }

      // Lógica para iniciar la conexión con Shopify
      const response = await fetch("/api/integrations/shopify/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopDomain: formattedDomain,
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
          Ingresa el dominio de tu tienda Shopify para comenzar el proceso de
          integración
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

        <Form {...form}>
          <form id="shopify-connection-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="shopDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dominio de tu tienda Shopify</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input
                        placeholder="tu-tienda.myshopify.com"
                        className="bg-background"
                        {...field}
                        disabled={isLoading}
                      />
                      <Shopify className="absolute right-2 size-5" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Ingresa el dominio de tu tienda Shopify. Ejemplo:
                    tu-tienda.myshopify.com
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-sm text-muted-foreground border-t gap-y-2">
        <Button
          type="submit"
          disabled={isLoading}
          variant={"defaultBlack"}
          size={"sm"}
          className="w-full"
          form="shopify-connection-form"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : (
            "Conectar tienda Shopify"
          )}
        </Button>
      </CardFooter>
    </Card>
    
  );
};
