"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { JsonFieldArray } from "@/components/universal/json-field-array";
import { KeywordInput } from "@/components/universal/keyword-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SpecificationsSectionProps {
  form: UseFormReturn<any>;
}

export default function SpecificationsSection({
  form,
}: SpecificationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Especificaciones del producto</CardTitle>
        <CardDescription>
          Define las dimensiones y especificaciones del producto.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar space-y-4">
        <FormField
          control={form.control}
          name="dimensions"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <JsonFieldArray
                  title="Dimensiones"
                  value={field.value || []}
                  onChange={field.onChange}
                  labelPlaceholder="Ej. Largo"
                  valuePlaceholder="Ej. 10 cm"
                  description="Agrega dimensiones del producto, ejemplo Largo, Ancho, etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <JsonFieldArray
                  title="Detalles"
                  value={field.value || []}
                  onChange={field.onChange}
                  labelPlaceholder="Ej. Material"
                  valuePlaceholder="Ej. Algodón"
                  description="Agrega detalles del producto, ejemplo Material, Tela, etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <span className="flex flex-col">
                <FormLabel>Palabras clave</FormLabel>
                <FormDescription>
                  Agrega palabras clave, ayuda a mejorar el rendimiento de tu
                  producto
                </FormDescription>
              </span>
              <FormControl>
                <KeywordInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Agrega palabras clave para mejorar la búsqueda..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
