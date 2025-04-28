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
import { EyeIcon, EyeOff, Loader } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PhoneInputWithCountry } from "@/components/universal/phone-input-country";
import {
  handleBusinessInvitation,
  proceedAfterAuthentication,
} from "@/lib/utils";

const formSchema = z.object({
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

export function LoginFormPhone({
  businessId,
  token,
}: {
  businessId: string | null;
  token: string | null;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "+52", // Prefijo de México por defecto
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: values.phone,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("No se pudo iniciar sesión");
      }

      toast.success("Inicio de sesión exitoso");

      // Si hay businessId y token, verificar la invitación y crear relación
      if (businessId && token) {
        await handleBusinessInvitation(data.user.id, businessId, token, router);
      } else {
        // Si no hay invitación, proceder normalmente
        await proceedAfterAuthentication(data.user.id, router);
      }
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Error al iniciar sesión", {
        description:
          error.message || "Por favor, verifica tus datos e intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-y-4"
      >
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
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Ingresa tu número con código de país (ej: +52 para México)
              </p>
            </FormItem>
          )}
        />

        <span className="flex flex-col gap-y-3">
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
                      className="pr-8 bg-background"
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
              </FormItem>
            )}
          />
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:underline text-[13px]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </span>

        <Button
          type="submit"
          size="default"
          variant={"default"}
          className="w-full bg-foreground text-background hover:bg-foreground/80 hover:text-background mt-5"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </Form>
  );
}
