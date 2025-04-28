"use client";

import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, EyeIcon, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { PhoneInputWithCountry } from "@/components/universal/phone-input-country";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "El nombre es requerido" }),
  lastName: z.string().min(1, { message: "El apellido es requerido" }),
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Correo electrónico inválido" }),
  phone: z
    .string()
    .min(1, { message: "El número de teléfono es requerido" })
    .refine((val) => /^\+[1-9]\d{6,14}$/.test(val), {
      message: "Ingresa el número con formato internacional (+523334445555)",
    }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export function RegisterForm({
  businessId,
  token,
}: {
  businessId: string | null;
  token: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "+52", // Prefijo de México por defecto
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      // Construir la URL de redirección incluyendo businessId y token si existen
      let redirectUrl = `${window.location.origin}/api/auth/callback?origin=1`;

      // Agregar parámetros de invitación si existen
      if (businessId && token) {
        redirectUrl += `&businessId=${businessId}&token=${token}`;
      }

      // Registrar el usuario con email y contraseña proporcionados
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        phone: values.phone,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error("Error al crear la cuenta", {
          description:
            error.message ||
            "Por favor, verifica tus datos e intenta de nuevo.",
        });
        return;
      }

      // Mostrar mensaje de éxito
      toast.success("Cuenta creada exitosamente", {
        description:
          "Te hemos enviado un correo electrónico para verificar tu cuenta.",
      });

      // Redirigir al usuario a una página de confirmación
      const confirmationUrl = `/register/confirmation?email=${values.email}`;
      router.push(confirmationUrl);
    } catch (error) {
      console.error("Error en el registro:", error);
      toast.error("Ocurrió un error inesperado", {
        description: "Por favor, intenta de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Construir la URL para el enlace de "Iniciar sesión" incluyendo businessId y token si existen
  let loginUrl = "/login";
  if (businessId && token) {
    loginUrl += `?businessId=${businessId}&token=${token}`;
  }

  return (
    <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4 px-5 md:px-0">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre(s)</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" className="bg-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido(s)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pérez"
                      className="bg-white"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    placeholder="correo@ejemplo.com"
                    className="bg-white"
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de teléfono</FormLabel>
                <FormControl>
                  <PhoneInputWithCountry
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder="8717544123"
                    disabled={loading}
                    error={form.formState.errors.phone?.message}
                    description="Ingresa tu número sin código de país, selecciónalo del menú desplegable."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <div className="relative w-full flex items-center justify-start">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-10 pl-3 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    variant={"link"}
                    size={"icon"}
                    type="button"
                    className="absolute right-3 size-fit text-muted-foreground hover:text-foreground"
                    onClick={toggleShowPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </Button>
                </div>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa al menos 6 caracteres
                </p>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="default"
            variant={"default"}
            className="w-full bg-foreground text-background hover:bg-foreground/80 hover:text-background mt-5"
            disabled={loading}
          >
            {loading ? (
              "Registrando..."
            ) : (
              <span className="flex items-center gap-2">
                {businessId && token ? "Unirme al negocio" : "Crear cuenta"}
                <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>
      </Form>

      <div className="w-full flex gap-x-3 items-center justify-center">
        <Separator className="flex-1" />
        <p className="text-sm text-muted-foreground shrink-0">
          ¿Ya tienes una cuenta?
        </p>
        <Separator className="flex-1" />
      </div>

      <Button
        className="w-full relative"
        size="default"
        variant="ghost"
        asChild
      >
        <Link href={loginUrl}>Iniciar sesión</Link>
      </Button>
    </div>
  );
}
