"use client";

import type React from "react";
import type { FeatureCollection } from "geojson";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentUpload } from "@/components/file-upload";
import { PhoneInputWithCountry } from "@/components/universal/phone-input-country";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { Tiktok } from "@/components/svgs/icons";
import { ImageUpload } from "@/app/(onboarding)/onboarding/_components/image-upload";
import { DeliveryMapWrapper } from "@/app/(onboarding)/onboarding/_components/delivery-map-wrapper";

// Lista de bancos en México
const MEXICAN_BANKS = [
  "BBVA",
  "Santander",
  "Banorte",
  "Citibanamex",
  "HSBC",
  "Scotiabank",
  "Inbursa",
  "Banco Azteca",
  "BanCoppel",
  "Afirme",
  "Banca Mifel",
  "Banco del Bajío",
  "Banregio",
  "Multiva",
  "Actinver",
  "Intercam Banco",
  "CI Banco",
  "Bansí",
  "Banco Famsa",
  "Banco Autofin",
  "Banco Compartamos",
  "Banco Forjadores",
  "Banco Inmobiliario Mexicano",
  "Banco Monex",
  "Banco PagaTodo",
  "Banco Sabadell",
  "Banco Shinhan",
  "Bank of America",
  "Bank of China",
  "Barclays Bank",
  "BNP Paribas",
  "Deutsche Bank",
  "Industrial and Commercial Bank of China",
  "JP Morgan",
  "Mizuho Bank",
  "MUFG Bank",
];

// Lista de sectores de negocio
const BUSINESS_SECTORS = [
  "Mueblería",
  "Tienda departamental",
  "Tienda de decoración",
  "Electrónica",
  "Ropa y accesorios",
  "Alimentos y bebidas",
  "Artículos para el hogar",
  "Ferretería",
  "Papelería",
  "Juguetería",
  "Deportes",
  "Tecnología",
  "Joyería",
  "Farmacia",
  "Librería",
  "Artesanías",
  "Mascotas",
  "Belleza y cuidado personal",
  "Floristería",
  "Otro",
];

// Definición de redes sociales disponibles
interface SocialNetwork {
  id: string;
  name: string;
  baseUrl: string;
  icon: React.ReactNode;
  placeholder: string;
}

const SOCIAL_NETWORKS: SocialNetwork[] = [
  {
    id: "facebook",
    name: "Facebook",
    baseUrl: "https://facebook.com/",
    icon: <Facebook className="size-4 text-blue-600" />,
    placeholder: "tunegocio",
  },
  {
    id: "instagram",
    name: "Instagram",
    baseUrl: "https://instagram.com/",
    icon: <Instagram className="size-4 text-pink-600" />,
    placeholder: "tunegocio",
  },
  {
    id: "twitter",
    name: "Twitter",
    baseUrl: "https://twitter.com/",
    icon: <Twitter className="size-4 text-sky-500" />,
    placeholder: "tunegocio",
  },
  {
    id: "youtube",
    name: "YouTube",
    baseUrl: "https://youtube.com/c/",
    icon: <Youtube className="size-4 text-red-600" />,
    placeholder: "tunegocio",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    baseUrl: "https://linkedin.com/company/",
    icon: <Linkedin className="size-4 text-blue-700" />,
    placeholder: "tunegocio",
  },
  {
    id: "tiktok",
    name: "TikTok",
    baseUrl: "https://tiktok.com/@",
    icon: <Tiktok className="!size-5 text-black" />,
    placeholder: "tunegocio",
  },
];

// Esquema de validación para el formulario de negocio
const businessFormSchema = z.object({
  business_name: z.string().min(2, {
    message: "El nombre del negocio debe tener al menos 2 caracteres.",
  }),
  business_legal_name: z.string().min(2, {
    message: "La razón social debe tener al menos 2 caracteres.",
  }),
  business_logo_url: z.string().min(1, {
    message: "El logo del negocio es obligatorio.",
  }),
  tax_situation_url: z.string().optional().nullable(),
  main_phone_number: z.string().optional(),
  contact_phone_number: z.string().min(10, {
    message: "El número de teléfono debe tener al menos 10 dígitos.",
  }),
  main_email: z
    .string()
    .email({
      message: "Por favor ingresa un correo electrónico válido.",
    })
    .optional(),
  business_sector: z.string().min(1, {
    message: "El sector o giro del negocio es obligatorio.",
  }),
  website_url: z
    .string()
    .url({
      message: "Por favor ingresa una URL válida.",
    })
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  bank_account_number: z
    .string()
    .refine((val) => val === "" || val.length === 18, {
      message: "La cuenta CLABE debe tener 18 dígitos.",
    })
    .refine((val) => val === "" || /^\d+$/.test(val), {
      message: "La cuenta CLABE solo debe contener números.",
    }),
  bank_name: z.string().min(1, {
    message: "El banco es obligatorio.",
  }),
  street: z.string().min(1, {
    message: "La calle es obligatoria.",
  }),
  external_number: z.string().min(1, {
    message: "El número exterior es obligatorio.",
  }),
  internal_number: z.string().optional().nullable(),
  neighborhood: z.string().min(1, {
    message: "La colonia es obligatoria.",
  }),
  postal_code: z.string().min(5, {
    message: "El código postal debe tener 5 dígitos.",
  }),
  city: z.string().min(1, {
    message: "La ciudad es obligatoria.",
  }),
  state: z.string().min(1, {
    message: "El estado es obligatorio.",
  }),
  country: z.string().default("México"),
  delivery_zones: z
    .array(
      z.object({
        city: z.string(),
        state: z.string(),
      })
    )
    .min(1, {
      message: "Debes seleccionar al menos una zona de entrega.",
    }),
  social_media: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      linkedin: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  commission_percentage: z.number().optional(),
});

type BusinessFormValues = z.infer<typeof businessFormSchema>;

interface BusinessInfoEditFormProps {
  business: any;
  geoJsonData: FeatureCollection | null;
  mapCities: any[];
  mapStates: any[];
  deliveryZonesFormatted: string[];
}

export function BusinessInfoEditForm({
  business,
  geoJsonData,
  mapCities,
  mapStates,
  deliveryZonesFormatted,
}: BusinessInfoEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formHasChanges, setFormHasChanges] = useState(false);
  const router = useRouter();

  // Valores por defecto del formulario basados en el negocio existente
  const defaultValues: Partial<BusinessFormValues> = {
    business_name: business.business_name || "",
    business_legal_name: business.business_legal_name || "",
    business_logo_url: business.business_logo_url || "",
    tax_situation_url: business.tax_situation_url || "",
    main_phone_number: business.main_phone_number || "",
    contact_phone_number: business.contact_phone_number || "",
    main_email: business.main_email || "",
    business_sector: business.business_sector || "",
    website_url: business.website_url || "",
    description: business.description || "",
    bank_account_number: business.bank_account_number || "",
    bank_name: business.bank_name || "",
    street: business.street || "",
    external_number: business.external_number || "",
    internal_number: business.internal_number || "",
    neighborhood: business.neighborhood || "",
    postal_code: business.postal_code || "",
    city: business.city || "",
    state: business.state || "",
    country: business.country || "México",
    delivery_zones: business.delivery_zones || [],
    social_media: business.social_media || {},
    commission_percentage: business.commission_percentage || 0,
  };

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues,
  });

  // Modify the handleDeliveryZonesChange function to properly mark the form as dirty
  const handleDeliveryZonesChange = (zones: string[]) => {
    // Convertir de formato "city|state" a objetos { city, state }
    const formattedZones = zones.map((zone) => {
      const [city, state] = zone.split("|");
      return { city, state };
    });

    // Set the value and mark the field as dirty
    form.setValue("delivery_zones", formattedZones, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  // Inicializar valores de redes sociales
  useEffect(() => {
    if (business.social_media) {
      const socialMedia = business.social_media;

      // Establecer los valores directamente en el formulario
      form.setValue("social_media", socialMedia);
    }
  }, [business.social_media, form]);

  // Add a watch for the delivery zones field to detect changes
  useEffect(() => {
    // Watch for form changes to control the Save button visibility
    const subscription = form.watch((value, { name, type }) => {
      // Check if the form is dirty or if delivery zones have changed
      const formIsDirty = form.formState.isDirty;

      // Compare delivery zones with the original values
      const deliveryZonesChanged =
        JSON.stringify(value.delivery_zones) !==
        JSON.stringify(defaultValues.delivery_zones);

      setFormHasChanges(formIsDirty || deliveryZonesChanged);
    });

    return () => subscription.unsubscribe();
  }, [form, form.formState.isDirty, defaultValues.delivery_zones]);

  async function onSubmit(data: BusinessFormValues) {
    try {
      setIsLoading(true);

      // Enviar datos al servidor usando la nueva ruta
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el negocio");
      }

      toast.success("Negocio actualizado correctamente", {
        description:
          "La información de tu negocio ha sido actualizada exitosamente.",
      });
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar el negocio:", error);
      toast.error("Error al actualizar el negocio", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado",
      });
    } finally {
      router.refresh();
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full space-y-5 lg:space-y-7">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sección: Información general */}
          <Card>
            <CardHeader>
              <CardTitle>Información general</CardTitle>
              <CardDescription>
                Ingresa la información general de tu negocio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-sidebar">
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

              <FormField
                control={form.control}
                name="tax_situation_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Constancia de situación fiscal (opcional)
                    </FormLabel>
                    <FormControl>
                      <DocumentUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        accept={["application/pdf"]}
                        label="Constancia de situación fiscal"
                      />
                    </FormControl>
                    <FormDescription>
                      Sube tu constancia de situación fiscal en formato PDF.
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
                      <FormLabel>Teléfono principal</FormLabel>
                      <FormControl>
                        <PhoneInputWithCountry {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de contacto</FormLabel>
                      <FormControl>
                        <PhoneInputWithCountry {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe brevemente tu negocio"
                        className="min-h-[100px] bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector o giro del negocio</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Selecciona un sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_SECTORS.map((sector) => (
                            <SelectItem key={sector} value={sector}>
                              {sector}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Indica a qué sector pertenece tu negocio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sección: Información bancaria */}
          <Card>
            <CardHeader>
              <CardTitle>Información bancaria</CardTitle>
              <CardDescription>
                Ingresa la información bancaria de tu negocio, a esta cuenta
                recibirás los pagos de Knoott.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-sidebar">
              <FormField
                control={form.control}
                name="business_legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa la razón social"
                        className="bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuenta CLABE</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background"
                          placeholder="18 dígitos"
                          maxLength={18}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Ingresa la CLABE interbancaria de 18 dígitos.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banco</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecciona un banco" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEXICAN_BANKS.map((bank) => (
                              <SelectItem key={bank} value={bank}>
                                {bank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sección: Dirección del establecimiento */}
          <Card>
            <CardHeader>
              <CardTitle>Dirección del establecimiento</CardTitle>
              <CardDescription>
                Ingresa la dirección de tu negocio, debe ser la dirección física
                donde estén tus oficinas, tienda, bodega, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-sidebar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background"
                          placeholder="Nombre de la calle"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="external_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número exterior</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-background"
                            placeholder="Núm. ext."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="internal_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número interior</FormLabel>
                        <FormControl>
                          <Input
                            className="bg-background"
                            placeholder="Núm. int. (opcional)"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colonia</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background"
                          placeholder="Nombre de la colonia"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código postal</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background"
                          placeholder="CP"
                          maxLength={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {mapStates.map((state) => (
                              <SelectItem key={state.value} value={state.name}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!form.getValues("state")}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecciona una ciudad" />
                          </SelectTrigger>
                          <SelectContent>
                            {mapCities
                              .filter(
                                (city) => city.state === form.getValues("state")
                              )
                              .map((city) => (
                                <SelectItem key={city.value} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input className="bg-background" disabled {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sección: Zonas de entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Zonas de entrega</CardTitle>
              <CardDescription>
                Ingresa las zonas donde realizas entregas, mostraremos tu
                catálogo a los usuarios que reciban dentro de tu zona de
                entrega.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-sidebar">
              <FormItem>
                <FormLabel>Selecciona las zonas donde entregas</FormLabel>
                <FormControl>
                  {geoJsonData &&
                  mapCities.length > 0 &&
                  mapStates.length > 0 ? (
                    <DeliveryMapWrapper
                      value={deliveryZonesFormatted}
                      onChange={handleDeliveryZonesChange}
                      initialCities={mapCities}
                      initialStates={mapStates}
                      geoJsonData={geoJsonData}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40 border rounded-md">
                      <p className="text-muted-foreground">Cargando mapa...</p>
                    </div>
                  )}
                </FormControl>
                <FormDescription>
                  Busca y selecciona las ciudades donde realizas entregas.
                </FormDescription>
                {form.formState.errors.delivery_zones && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.delivery_zones.message}
                  </p>
                )}
              </FormItem>
            </CardContent>
          </Card>

          {/* Sección: Redes sociales */}
          <Card>
            <CardHeader>
              <CardTitle>Redes sociales</CardTitle>
              <CardDescription>
                Ingresa tus nombres de usuario en las redes sociales que
                utilices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-sidebar">
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

              <div className="space-y-3">
                {/* Facebook */}
                <FormField
                  control={form.control}
                  name="social_media.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Facebook className="size-4 text-blue-600" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border rounded-r-md">
                            <div className="pl-2 text-sm text-muted-foreground">
                              https://facebook.com/
                            </div>
                            <Input
                              className="border-0 flex-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring pl-0"
                              placeholder="tunegocio"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instagram */}
                <FormField
                  control={form.control}
                  name="social_media.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Instagram className="size-4 text-pink-600" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border rounded-r-md">
                            <div className="pl-2 text-sm text-muted-foreground">
                              https://instagram.com/
                            </div>
                            <Input
                              className="border-0 flex-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring pl-0"
                              placeholder="tunegocio"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Twitter */}
                <FormField
                  control={form.control}
                  name="social_media.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Twitter className="size-4 text-sky-500" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border rounded-r-md">
                            <div className="pl-2 text-sm text-muted-foreground">
                              https://twitter.com/
                            </div>
                            <Input
                              className="border-0 flex-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring pl-0"
                              placeholder="tunegocio"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* YouTube */}
                <FormField
                  control={form.control}
                  name="social_media.youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Youtube className="size-4 text-red-600" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border rounded-r-md">
                            <div className="pl-2 text-sm text-muted-foreground">
                              https://youtube.com/c/
                            </div>
                            <Input
                              className="border-0 flex-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring pl-0"
                              placeholder="tunegocio"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* LinkedIn */}
                <FormField
                  control={form.control}
                  name="social_media.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Linkedin className="size-4 text-blue-700" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border rounded-r-md">
                            <div className="pl-2 text-sm text-muted-foreground">
                              https://linkedin.com/company/
                            </div>
                            <Input
                              className="border-0 flex-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring pl-0"
                              placeholder="tunegocio"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TikTok */}
                <FormField
                  control={form.control}
                  name="social_media.tiktok"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Tiktok className="!size-5 text-black" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border rounded-r-md">
                            <div className="pl-2 text-sm text-muted-foreground">
                              https://tiktok.com/@
                            </div>
                            <Input
                              className="border-0 flex-1 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring pl-0"
                              placeholder="tunegocio"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón de envío - solo visible cuando hay cambios */}
          {formHasChanges && (
            <Button
              variant={"defaultBlack"}
              size={"sm"}
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Guardando cambios..." : "Guardar cambios"}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
