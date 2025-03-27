"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Database } from "@/database.types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Esquema de validación con Zod
const addressFormSchema = z.object({
  street_address: z.string().min(1, { message: "La dirección es requerida" }),
  city: z.string().min(1, { message: "La ciudad es requerida" }),
  state: z.string().min(1, { message: "El estado es requerido" }),
  postal_code: z
    .string()
    .min(5, { message: "El código postal debe tener 5 dígitos" })
    .max(5, { message: "El código postal debe tener 5 dígitos" })
    .refine((val) => /^\d+$/.test(val), {
      message: "El código postal solo debe contener números",
    }),
  country: z.string().default("México"),
  is_default: z.boolean().default(false),
  additional_notes: z.string().optional(),
  tag: z.string().optional(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

// Lista de estados mexicanos
const mexicoStates = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Coahuila",
  "Colima",
  "Ciudad de México",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "México",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas",
];

type Address = Database["public"]["Tables"]["wedding_addresses"]["Row"];

interface EditAddressFormProps {
  address: Address;
  onSuccess?: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export function EditAddressForm({
  address,
  onSuccess,
  setIsSubmitting,
}: EditAddressFormProps) {
  const router = useRouter();

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
      additional_notes: address.additional_notes || "",
      tag: address.tag || "",
    },
  });

  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    try {
      // Realizar la llamada a la API para actualizar
      const response = await fetch(`/api/addresses/${address.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la dirección"
        );
      }

      toast.success("Dirección actualizada exitosamente");

      if (onSuccess) onSuccess();
      router.refresh()
    } catch (error) {
      console.error("Error al actualizar la dirección:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar la dirección"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Para sugerencias de etiquetas
  const handleTagSuggestion = (tag: string) => {
    form.setValue("tag", tag);
  };

  return (
    <Form {...form}>
      <form
        id="address-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <span className="w-full h-fit space-y-2">
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['_(opcional)'] after:text-muted-foreground after:text-xs">
                  Nombre de la dirección
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-sidebar"
                    placeholder="Ej: Casa, Oficina, Trabajo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full h-fit flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleTagSuggestion("Casa")}
            >
              Casa
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleTagSuggestion("Oficina")}
            >
              Oficina
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleTagSuggestion("Bodega")}
            >
              Bodega
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => handleTagSuggestion("Negocio")}
            >
              Negocio
            </Button>
          </div>
        </span>

        <FormField
          control={form.control}
          name="street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['*'] after:text-destructive">
                Dirección
              </FormLabel>
              <FormControl>
                <Input
                  className="bg-sidebar"
                  placeholder="Calle, número, colonia"
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:text-destructive">
                  Ciudad
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-sidebar"
                    placeholder="Ej: Guadalajara"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:text-destructive">
                  Estado
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-sidebar">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mexicoStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:text-destructive">
                  Código Postal
                </FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="bg-sidebar"
                    placeholder="Ej: 44600"
                    maxLength={5}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, "");
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="after:content-['*'] after:text-destructive">
                  País
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-sidebar"
                    value={field.value}
                    onChange={field.onChange}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additional_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="after:content-['_(opcional)'] after:text-muted-foreground after:text-xs">
                Notas adicionales
              </FormLabel>
              <FormControl>
                <Textarea
                  className="bg-sidebar"
                  placeholder="Ej: Entrada por caseta, requiere de clave..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Establecer como dirección predeterminada</FormLabel>
                <FormDescription>
                  Esta será la dirección principal para la entrega de tus
                  regalos
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
