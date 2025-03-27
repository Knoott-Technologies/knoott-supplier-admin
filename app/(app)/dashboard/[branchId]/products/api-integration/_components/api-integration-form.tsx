"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Save, Webhook } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Magento,
  Shopify,
  Wondersign,
  WooCommerce,
} from "@/components/svgs/icons";

// Esquema de validación para el formulario
const apiIntegrationSchema = z.object({
  provider: z.string({
    required_error: "Por favor selecciona un proveedor",
  }),
  api_url: z.string().url({
    message: "Por favor ingresa una URL válida",
  }),
  api_key: z.string().min(1, {
    message: "Por favor ingresa la clave API",
  }),
  api_secret: z.string().optional(),
  additional_params: z.string().optional(),
  auto_sync: z.boolean().default(true),
  sync_frequency: z.string().default("daily"),
});

type ApiIntegrationFormValues = z.infer<typeof apiIntegrationSchema>;

// Tipo para los datos iniciales que vienen del servidor
type ApiIntegrationData = {
  id?: number;
  provider?: string;
  api_url?: string;
  api_key?: string;
  api_secret?: string | null;
  additional_params?: string;
  auto_sync?: boolean;
  sync_frequency?: string;
  last_sync_at?: string | null;
  last_sync_status?: string | null;
  last_sync_message?: string | null;
};

export function ApiIntegrationForm({
  branchId,
  initialData,
}: {
  branchId: string;
  initialData?: ApiIntegrationData | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar el formulario con los datos existentes o valores predeterminados
  const form = useForm<ApiIntegrationFormValues>({
    resolver: zodResolver(apiIntegrationSchema),
    defaultValues: {
      provider: initialData?.provider || "",
      api_url: initialData?.api_url || "",
      api_key: initialData?.api_key || "",
      api_secret: initialData?.api_secret || "",
      additional_params: initialData?.additional_params || "",
      auto_sync:
        initialData?.auto_sync !== undefined ? initialData.auto_sync : true,
      sync_frequency: initialData?.sync_frequency || "daily",
    },
  });

  const selectedProvider = form.watch("provider");
  const autoSync = form.watch("auto_sync");

  const onSubmit = async (data: ApiIntegrationFormValues) => {
    setIsSubmitting(true);

    try {
      // Validar el formato JSON de los parámetros adicionales
      if (data.additional_params) {
        try {
          JSON.parse(data.additional_params);
        } catch (e) {
          toast.error(
            "El formato JSON de los parámetros adicionales es inválido"
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Enviar los datos al servidor
      const response = await fetch(
        `/api/branches/${branchId}/api-integration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar la configuración");
      }

      toast.success("Configuración de API guardada correctamente");
      router.refresh(); // Actualizar los datos de la página
    } catch (error) {
      console.error("Error saving API configuration:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la configuración"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    const values = form.getValues();

    if (!values.api_url || !values.api_key) {
      toast.error("Por favor completa la URL de la API y la clave API");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/branches/${branchId}/api-integration/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al probar la conexión");
      }

      toast.success("Conexión exitosa con la API");
    } catch (error) {
      console.error("Error testing API connection:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al probar la conexión"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración de API</CardTitle>
        <CardDescription>
          Configura la conexión con la API de tu proveedor para importar
          productos automáticamente. Los productos se sincronizarán diariamente
          con tu tienda.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-y-4 bg-sidebar">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecciona un proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="wondersign">
                        <span className="flex items-center gap-x-2">
                          <Wondersign className="size-4" />
                          Wondersign
                        </span>
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="shopify">
                        <span className="flex items-center gap-x-2">
                          <Shopify className="size-4" />
                          Shopify
                        </span>
                      </SelectItem>
                      <SelectItem
                        className="cursor-pointer"
                        value="woocommerce"
                      >
                        <span className="flex items-center gap-x-2">
                          <WooCommerce className="size-4" />
                          WooCommerce
                        </span>
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="magento">
                        <span className="flex items-center gap-x-2">
                          <Magento className="size-4" />
                          Magento
                        </span>
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="custom">
                        <span className="flex items-center gap-x-2">
                          <Webhook className="size-4" />
                          API Personalizada
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona el proveedor de la API que deseas integrar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la API</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="https://api.ejemplo.com/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedProvider === "wondersign"
                      ? "Ejemplo: https://api.wondersign.com/v2"
                      : selectedProvider === "shopify"
                      ? "Ejemplo: https://tu-tienda.myshopify.com/admin/api/2023-01"
                      : "URL base de la API del proveedor"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave API / Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-background"
                      placeholder="Ingresa tu clave API o token"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {selectedProvider === "wondersign"
                      ? "Tu clave API de Wondersign"
                      : selectedProvider === "shopify"
                      ? "Tu token de acceso de Shopify"
                      : "Clave de autenticación para la API"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedProvider === "shopify" ||
              selectedProvider === "woocommerce" ||
              selectedProvider === "magento" ||
              selectedProvider === "custom") && (
              <FormField
                control={form.control}
                name="api_secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secreto API / Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="bg-background"
                        placeholder="Ingresa el secreto API o contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedProvider === "shopify"
                        ? "Tu clave secreta de API de Shopify"
                        : "Secreto adicional requerido para la autenticación"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="additional_params"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parámetros adicionales (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"param1": "valor1", "param2": "valor2"}'
                      className="min-h-[100px] bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Parámetros adicionales en formato JSON para la configuración
                    de la API
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Probar conexión
            </Button>
            <Button
              type="submit"
              variant="defaultBlack"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar configuración
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
