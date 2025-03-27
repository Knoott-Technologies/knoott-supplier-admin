"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Database } from "@/database.types";

const personalInfoSchema = z.object({
  first_name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede exceder los 50 caracteres" }),
  last_name: z
    .string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
    .max(50, { message: "El apellido no puede exceder los 50 caracteres" }),
  email: z
    .string()
    .email({ message: "Por favor ingresa un correo electrónico válido" }),
  phone_number: z
    .string()
    .min(10, { message: "El número telefónico debe tener al menos 10 dígitos" })
    .max(15, {
      message: "El número telefónico no puede exceder los 15 dígitos",
    })
    .regex(/^\+?[0-9]+$/, {
      message:
        "El número telefónico solo debe contener dígitos y opcionalmente un '+' al inicio",
    }),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

export const PersonalInfoForm = ({
  user,
}: {
  user: Database["public"]["Tables"]["users"]["Row"];
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const supabase = createClient();

  // Formatear el número de teléfono para asegurar que tenga el formato correcto
  const formatPhoneNumber = (phone: string) => {
    // Si ya tiene un '+', lo dejamos así
    if (phone.startsWith("+")) return phone;
    // Si empieza con números, añadimos un '+'
    return `+${phone}`;
  };

  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number
        ? formatPhoneNumber(user.phone_number)
        : "",
    },
  });

  // Detectar cambios en el formulario
  useEffect(() => {
    const subscription = form.watch(() => {
      const currentValues = form.getValues();
      const hasChanged =
        currentValues.first_name !== user.first_name ||
        currentValues.last_name !== user.last_name ||
        currentValues.email !== user.email ||
        formatPhoneNumber(currentValues.phone_number) !==
          formatPhoneNumber(user.phone_number);

      setFormChanged(hasChanged);
    });

    return () => subscription.unsubscribe();
  }, [form, user]);

  const onSubmit = async (data: PersonalInfoValues) => {
    setIsSubmitting(true);

    try {
      // Actualizar en la tabla users
      const { error: profileError } = await supabase
        .from("users")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Actualizar en Auth (user_meta_data)
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
        phone: data.phone_number,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
      });

      if (authError) throw authError;

      toast.success("Información personal actualizada correctamente");
      setFormChanged(false);
    } catch (error) {
      console.error("Error al actualizar información:", error);
      toast.error("Error al actualizar la información");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Información Personal</CardTitle>
        <CardDescription>
          Estos son los datos personales que nos proporcionaste, puedes
          editarlos en cualquier momento.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background"
                        placeholder="Tu nombre"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background"
                        placeholder="Tu apellido"
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
                      placeholder="tu@correo.com"
                      className="bg-background"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este correo también será usado para iniciar sesión.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de teléfono</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="+521234567890"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Incluye el código de país (ej. +52 para México).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {formChanged && (
              <div className="flex justify-end w-full">
                <Button
                  type="submit"
                  variant={"defaultBlack"}
                  size={"sm"}
                  className="flex items-center gap-2 w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
