"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import { PhoneInputWithCountry } from "@/components/universal/phone-input-country";

// Esquema de validación para el formulario de sucursal
const branchFormSchema = z
  .object({
    branch_name: z.string().min(2, {
      message: "El nombre de la sucursal debe tener al menos 2 caracteres.",
    }),
    contact_phone_number: z.string().min(10, {
      message: "El número de teléfono debe tener al menos 10 dígitos.",
    }),
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
    confirm_bank_account: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.bank_account_number && data.confirm_bank_account) {
        return data.bank_account_number === data.confirm_bank_account;
      }
      return true;
    },
    {
      message: "Las cuentas CLABE no coinciden",
      path: ["confirm_bank_account"],
    }
  );

type BranchFormValues = z.infer<typeof branchFormSchema>;

export function BranchForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business_id");

  // Valores por defecto del formulario
  const defaultValues: Partial<BranchFormValues> = {
    branch_name: "",
    contact_phone_number: "",
    description: "",
    bank_account_number: "",
    confirm_bank_account: "",
  };

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchFormSchema),
    defaultValues,
  });

  async function onSubmit(data: BranchFormValues) {
    if (!businessId) {
      toast.error("No se encontró el ID del negocio");
      return;
    }

    try {
      setIsLoading(true);

      // Enviar datos al servidor
      const response = await fetch("/api/branches/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          provider_business_id: businessId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la sucursal");
      }

      const branch = await response.json();

      // Conectar usuario a la sucursal como administrador
      const connectResponse = await fetch("/api/user-branches/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider_id: branch.id,
          role: "admin",
        }),
      });

      if (!connectResponse.ok) {
        const error = await connectResponse.json();
        console.error("Error al conectar usuario a la sucursal:", error);
        // Continuamos aunque haya error en la conexión
      }

      toast.success("Sucursal creada correctamente", {
        description: "Has sido asignado como administrador de esta sucursal.",
      });

      // Redirigir al dashboard o a la página de sucursales
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al crear la sucursal:", error);
      toast.error("Error al crear la sucursal", {
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Agregar sucursal</CardTitle>
        <CardDescription>
          Ingresa la información de la sucursal para tu negocio.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-y-4 bg-sidebar">
            <FormField
              control={form.control}
              name="branch_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la sucursal</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="Ej: Sucursal Centro"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nombre que identifica a esta sucursal.
                  </FormDescription>
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
                  <FormDescription>
                    Número de teléfono para contactar a esta sucursal.
                  </FormDescription>
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
                      placeholder="Describe brevemente esta sucursal"
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
              name="confirm_bank_account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar cuenta CLABE</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      placeholder="Confirma los 18 dígitos"
                      maxLength={18}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t">
            <Button
              type="button"
              variant="outline"
              size={"sm"}
              onClick={() => router.push("/dashboard/branches")}
            >
              Cancelar
            </Button>
            <Button
              size={"sm"}
              variant={"defaultBlack"}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Guardando información..." : "Crear sucursal"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
