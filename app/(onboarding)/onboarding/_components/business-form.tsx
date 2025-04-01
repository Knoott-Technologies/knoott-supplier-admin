"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { generateReferenceFromName } from "@/lib/utils";
import { ImageUpload } from "./image-upload";
import { PhoneInputWithCountry } from "@/components/universal/phone-input-country";
import { Facebook, Instagram, Twitter } from "lucide-react";

// Esquema de validación para el formulario de negocio
const businessFormSchema = z.object({
  business_name: z.string().min(2, {
    message: "El nombre del negocio debe tener al menos 2 caracteres.",
  }),
  business_logo_url: z.string().min(1, {
    message: "El logo del negocio es obligatorio.",
  }),
  main_phone_number: z.string().optional(),
  main_email: z
    .string()
    .email({
      message: "Por favor ingresa un correo electrónico válido.",
    })
    .optional(),
  business_sector: z.string().min(2, {
    message: "El sector o giro del negocio es obligatorio.",
  }),
  website_url: z
    .string()
    .url({
      message: "Por favor ingresa una URL válida.",
    })
    .optional()
    .or(z.literal("")),
  social_media: z
    .object({
      facebook: z.string().url().optional().or(z.literal("")),
      instagram: z.string().url().optional().or(z.literal("")),
      twitter: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});

type BusinessFormValues = z.infer<typeof businessFormSchema>;

export function BusinessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Valores por defecto del formulario
  const defaultValues: Partial<BusinessFormValues> = {
    business_name: "",
    business_logo_url: "",
    main_phone_number: "",
    main_email: "",
    business_sector: "",
    website_url: "",
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  };

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues,
  });

  async function onSubmit(data: BusinessFormValues) {
    try {
      setIsLoading(true);

      // Generar referencia a partir del nombre del negocio
      const reference = generateReferenceFromName(data.business_name);

      // Enviar datos al servidor
      const response = await fetch("/api/businesses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          reference,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el negocio");
      }

      const business = await response.json();

      toast.success("Negocio creado correctamente", {
        description: "Ahora puedes agregar sucursales a tu negocio.",
      });

      // Redirigir a la página de creación de sucursales
      router.push(`/onboarding/branches?business_id=${business.id}`);
    } catch (error) {
      console.error("Error al crear el negocio:", error);
      toast.error("Error al crear el negocio", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-background">
        <CardTitle>Crear nuevo negocio</CardTitle>
        <CardDescription>
          Ingresa la información de tu negocio para comenzar a vender tus
          productos.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex-col flex gap-y-4 bg-sidebar">
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del negocio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa el nombre de tu negocio"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este nombre será visible para tus clientes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="business_logo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo del negocio</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value ? [field.value] : []}
                      onChange={(urls) => field.onChange(urls[0] || "")}
                      maxFiles={1}
                    />
                  </FormControl>
                  <FormDescription>
                    Sube una imagen cuadrada para tu logo (máximo 5MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="main_phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de contacto</FormLabel>
                    <FormControl>
                      <PhoneInputWithCountry
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="main_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico de contacto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="correo@ejemplo.com"
                        className="bg-background"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="business_sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector o giro del negocio</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="Ej: Retail, Restaurante, Servicios"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Indica a qué sector pertenece tu negocio.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sitio web</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="https://www.tunegocio.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_media.facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl>
                    <div className="w-full flex">
                      <div className="size-9 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                        <Facebook className="size-4 text-blue-600" />
                      </div>
                      <Input
                        className="bg-background"
                        placeholder="https://facebook.com/tunegocio"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_media.instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl>
                    <div className="w-full flex">
                      <div className="size-9 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                        <Instagram className="size-4 text-pink-600" />
                      </div>
                      <Input
                        className="bg-background"
                        placeholder="https://instagram.com/tunegocio"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="social_media.twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter</FormLabel>
                  <FormControl>
                    <div className="w-full flex">
                      <div className="size-9 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                        <Twitter className="size-4 text-sky-500" />
                      </div>
                      <Input
                        className="bg-background"
                        placeholder="https://twitter.com/tunegocio"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t bg-background">
            <Button
              variant={"defaultBlack"}
              size={"sm"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Guardando información..." : "Continuar"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
