"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { generateReferenceFromName } from "@/lib/utils";
import { ImageUpload } from "./image-upload";
import { PhoneInputWithCountry } from "@/components/universal/phone-input-country";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeliveryMapWrapper } from "./delivery-map-wrapper";
import { Tiktok } from "@/components/svgs/icons";
import { DocumentUpload } from "@/components/file-upload";

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
  tax_situation_url: z.string().optional(),
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
    })
    .optional(),
  bank_name: z.string().min(1, {
    message: "El banco es obligatorio.",
  }),
  street: z.string().min(1, {
    message: "La calle es obligatoria.",
  }),
  external_number: z.string().min(1, {
    message: "El número exterior es obligatorio.",
  }),
  internal_number: z.string().optional(),
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
  delivery_zones: z.array(z.string()).min(1, {
    message: "Debes seleccionar al menos una zona de entrega.",
  }),
  facebook_username: z.string().optional(),
  instagram_username: z.string().optional(),
  twitter_username: z.string().optional(),
  youtube_username: z.string().optional(),
  linkedin_username: z.string().optional(),
  tiktok_username: z.string().optional(),
});

type BusinessFormValues = z.infer<typeof businessFormSchema>;

export function BusinessForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");

  // Valores por defecto del formulario
  const defaultValues: Partial<BusinessFormValues> = {
    business_name: "",
    business_legal_name: "",
    business_logo_url: "",
    tax_situation_url: "",
    main_phone_number: "",
    contact_phone_number: "",
    main_email: "",
    business_sector: "",
    website_url: "",
    description: "",
    bank_account_number: "",
    bank_name: "",
    street: "",
    external_number: "",
    internal_number: "",
    neighborhood: "",
    postal_code: "",
    city: "",
    state: "",
    country: "México",
    delivery_zones: [],
    facebook_username: "",
    instagram_username: "",
    twitter_username: "",
    youtube_username: "",
    linkedin_username: "",
    tiktok_username: "",
  };

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues,
  });

  // Cargar estados y sectores al montar el componente
  useEffect(() => {
    const fetchStatesAndSectors = async () => {
      try {
        // Cargar estados
        const statesResponse = await fetch("/api/states-cities?type=states");
        const statesData = await statesResponse.json();
        setStates(statesData.states || []);

        // Cargar sectores
        const sectorsResponse = await fetch("/api/states-cities?type=sectors");
        const sectorsData = await sectorsResponse.json();
        setSectors(sectorsData.sectors || []);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al cargar datos de estados y sectores");
      }
    };

    fetchStatesAndSectors();
  }, []);

  // Cargar ciudades cuando cambia el estado seleccionado
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) {
        setCities([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/states-cities?type=cities&state=${encodeURIComponent(
            selectedState
          )}`
        );
        const data = await response.json();
        setCities(data.cities || []);
      } catch (error) {
        console.error("Error al cargar ciudades:", error);
        toast.error("Error al cargar ciudades");
      }
    };

    fetchCities();
  }, [selectedState]);

  // Manejar cambio de estado en el formulario
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    form.setValue("state", state);
    form.setValue("city", ""); // Resetear ciudad al cambiar estado
  };

  // Obtener la URL completa de una red social
  const getSocialNetworkUrl = (networkId: string, username: string): string => {
    const network = SOCIAL_NETWORKS.find((n) => n.id === networkId);
    if (!network || !username) return "";
    return `${network.baseUrl}${username}`;
  };

  async function onSubmit(data: BusinessFormValues) {
    try {
      setIsLoading(true);

      // Generar referencia a partir del nombre del negocio
      const reference = generateReferenceFromName(data.business_name);

      // Convertir redes sociales a formato para guardar
      const socialMedia: Record<string, string> = {};

      // Agregar cada red social si tiene un username
      if (data.facebook_username) {
        socialMedia.facebook = getSocialNetworkUrl(
          "facebook",
          data.facebook_username
        );
      }
      if (data.instagram_username) {
        socialMedia.instagram = getSocialNetworkUrl(
          "instagram",
          data.instagram_username
        );
      }
      if (data.twitter_username) {
        socialMedia.twitter = getSocialNetworkUrl(
          "twitter",
          data.twitter_username
        );
      }
      if (data.youtube_username) {
        socialMedia.youtube = getSocialNetworkUrl(
          "youtube",
          data.youtube_username
        );
      }
      if (data.linkedin_username) {
        socialMedia.linkedin = getSocialNetworkUrl(
          "linkedin",
          data.linkedin_username
        );
      }
      if (data.tiktok_username) {
        socialMedia.tiktok = getSocialNetworkUrl(
          "tiktok",
          data.tiktok_username
        );
      }

      // Enviar datos al servidor
      const response = await fetch("/api/businesses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          reference,
          // Asegurarse de que delivery_zones sea un array de objetos para Supabase
          delivery_zones: data.delivery_zones.map((zone) => {
            const [city, state] = zone.split("|");
            return { city: city.trim(), state: state.trim() };
          }),
          // Convertir redes sociales a formato para guardar
          social_media: socialMedia,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el negocio");
      }

      const business = await response.json();

      toast.success("Negocio creado correctamente", {
        description: "Tu negocio ha sido registrado exitosamente.",
      });

      // Redirigir al dashboard
      router.push(`/dashboard`);
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
          <CardContent className="flex-col flex gap-y-6 bg-sidebar">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información general</h3>

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
                          {sectors.map((sector) => (
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
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información bancaria</h3>
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
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Dirección del establecimiento
              </h3>

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
                          onValueChange={handleStateChange}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
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
                          disabled={!selectedState}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Selecciona una ciudad" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
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
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Zonas de entrega</h3>

              <FormField
                control={form.control}
                name="delivery_zones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecciona las zonas donde entregas</FormLabel>
                    <FormControl>
                      <DeliveryMapWrapper
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Busca y selecciona las ciudades donde realizas entregas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
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

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Redes sociales (opcionales)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ingresa tus nombres de usuario en las redes sociales que
                  utilices.
                </p>
              </div>

              <div className="space-y-3">
                {/* Facebook */}
                <FormField
                  control={form.control}
                  name="facebook_username"
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
                  name="instagram_username"
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
                  name="twitter_username"
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
                  name="youtube_username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="w-full flex">
                          <div className="size-10 shrink-0 aspect-square bg-background border border-r-0 flex items-center justify-center">
                            <Youtube className="size-4 text-red-600" />
                          </div>
                          <div className="flex-1 flex items-center bg-background border">
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
                  name="linkedin_username"
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
                  name="tiktok_username"
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t bg-background">
            <Button
              variant={"defaultBlack"}
              size={"sm"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Guardando información..." : "Guardar negocio"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
