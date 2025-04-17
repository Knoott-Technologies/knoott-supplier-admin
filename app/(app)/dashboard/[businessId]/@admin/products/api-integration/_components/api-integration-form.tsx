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
import { Eye, EyeOff, Loader2, Webhook } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Magento,
  Shopify,
  Wondersign,
  WooCommerce,
} from "@/components/svgs/icons";

// Validación del formulario
const apiIntegrationSchema = z.object({
  provider: z.string({ required_error: "Por favor selecciona un proveedor" }),
  api_url: z.string().url({ message: "Debes ingresar una URL válida" }),
  api_key: z.string().min(1, { message: "La clave API es obligatoria" }),
  api_secret: z.string().optional(),
  additional_params: z.string().optional(),
  auto_sync: z.boolean().default(true),
  sync_frequency: z.string().default("daily"),
});

type ApiIntegrationFormValues = z.infer<typeof apiIntegrationSchema>;

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
  businessId,
  initialData,
}: {
  businessId: string;
  initialData?: ApiIntegrationData | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

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

  // Función para mostrar temporalmente la clave API
  const handleShowApiKey = () => {
    setShowApiKey(true);
    // Ocultar después de 6 segundos
    setTimeout(() => {
      setShowApiKey(false);
    }, 6000);
  };

  // Función para mostrar temporalmente el secreto API
  const handleShowApiSecret = () => {
    setShowApiSecret(true);
    // Ocultar después de 6 segundos
    setTimeout(() => {
      setShowApiSecret(false);
    }, 6000);
  };

  const onSubmit = async (data: ApiIntegrationFormValues) => {
    setIsSubmitting(true);

    try {
      if (data.additional_params) {
        try {
          JSON.parse(data.additional_params);
        } catch {
          toast.error(
            "El formato de los parámetros adicionales no es un JSON válido."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch(
        `/api/branches/${businessId}/api-integration`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al guardar la configuración."
        );
      }

      toast.success("Integración configurada correctamente.");
      router.refresh();
    } catch (error) {
      console.error("Error saving API configuration:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la configuración."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    const values = form.getValues();

    if (!values.api_url || !values.api_key) {
      toast.error(
        "Debes ingresar la URL de la API y la clave o token de acceso."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `/api/branches/${businessId}/api-integration/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo establecer conexión.");
      }

      toast.success("Conexión establecida exitosamente.");
    } catch (error) {
      console.error("Error testing API connection:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al probar la conexión."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integración con API</CardTitle>
        <CardDescription>
          Conecta tu tienda con un proveedor externo para sincronizar productos
          automáticamente. Puedes configurar claves y parámetros personalizados.
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
                  <FormLabel>Proveedor de integración</FormLabel>
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
                      <SelectItem value="wondersign">
                        <span className="flex items-center gap-x-2">
                          <Wondersign className="size-4" />
                          Wondersign
                        </span>
                      </SelectItem>
                      <SelectItem value="shopify">
                        <span className="flex items-center gap-x-2">
                          <Shopify className="size-4" />
                          Shopify
                        </span>
                      </SelectItem>
                      <SelectItem value="woocommerce">
                        <span className="flex items-center gap-x-2">
                          <WooCommerce className="size-4" />
                          WooCommerce
                        </span>
                      </SelectItem>
                      <SelectItem value="magento">
                        <span className="flex items-center gap-x-2">
                          <Magento className="size-4" />
                          Magento
                        </span>
                      </SelectItem>
                      <SelectItem value="custom">
                        <span className="flex items-center gap-x-2">
                          <Webhook className="size-4" />
                          API Personalizada
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona el servicio con el cual deseas sincronizar tu
                    catálogo de productos.
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
                  <FormLabel>URL base de la API</FormLabel>
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
                      : "Ingresa la URL base proporcionada por el proveedor."}
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
                  <FormLabel>Clave API / Token de acceso</FormLabel>
                  <div className="flex items-center gap-x-0">
                    <FormControl>
                      <Input
                        type={showApiKey ? "text" : "password"}
                        className="bg-background pr-10"
                        placeholder="Ingresa tu clave o token de autenticación"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-l-0"
                      onClick={handleShowApiKey}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showApiKey ? "Ocultar clave" : "Mostrar clave"}
                      </span>
                    </Button>
                  </div>
                  <FormDescription>
                    Este valor es encriptado y almacenado bajo estándares de
                    seguridad. Asegúrate de copiarlo correctamente desde tu
                    proveedor.
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
                    <FormLabel>Secreto API / Contraseña adicional</FormLabel>
                    <div className="flex items-center gap-x-0">
                      <FormControl>
                        <Input
                          type={showApiSecret ? "text" : "password"}
                          className="bg-background flex-1"
                          placeholder="Ingresa el secreto o contraseña de la API"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="border-l-0 shrink-0"
                        onClick={handleShowApiSecret}
                      >
                        {showApiSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showApiSecret
                            ? "Ocultar secreto"
                            : "Mostrar secreto"}
                        </span>
                      </Button>
                    </div>
                    <FormDescription>
                      Campo adicional para autenticación. Este dato también será
                      protegido mediante encriptación.
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
                  <FormLabel>Parámetros adicionales (formato JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"param1": "valor1", "param2": "valor2"}'
                      className="min-h-[100px] bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Si tu proveedor requiere parámetros extra, puedes
                    ingresarlos aquí en formato JSON válido.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex gap-2 justify-end border-t">
            {!isSubmitting && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleTestConnection}
              >
                Probar conexión
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              variant="defaultBlack"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar configuración"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
