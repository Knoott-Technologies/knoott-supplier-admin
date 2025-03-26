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
import { EyeIcon, EyeOff, Mail, Loader } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo electrónico es requerido" })
    .email({ message: "Correo electrónico inválido" }),
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export function LoginFormEmail() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Función para manejar el inicio de sesión
  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setLoading(true);
    try {
      // Iniciar sesión con email y contraseña
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("No se pudo iniciar sesión");
      }

      toast.success("Inicio de sesión exitoso");
      // Si no encuentra userProvider, redirigir a la ruta general
      return router.push("/dashboard");
    } catch (error: any) {
      console.error("Error durante el inicio de sesión:", error);
      toast.error("Error al iniciar sesión", {
        description: "Por favor, verifica tus datos e intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Form {...loginForm}>
      <form
        onSubmit={loginForm.handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-y-4"
      >
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <div className="relative items-center justify-start flex">
                  <Mail
                    className={cn(
                      "absolute right-3 size-4 text-muted-foreground"
                    )}
                  />
                  <Input
                    placeholder="correo@ejemplo.com"
                    className="pr-8 bg-white"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <span className="flex flex-col gap-y-3">
          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <div className="relative w-full flex items-center justify-start">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pr-8 bg-white"
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
