"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploadDropzone } from "@/components/universal/image-upload-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ImagesSectionProps {
  form: UseFormReturn<any>;
  productId?: string | null;
  hasVariants?: boolean;
}

export default function ImagesSection({
  form,
  productId,
  hasVariants = false,
}: ImagesSectionProps) {
  // Only show this section if the product has variants
  // For products without variants, images are handled in NoVariantsSection
  if (!hasVariants) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes principales del producto</CardTitle>
        <CardDescription>
          Estas son las imágenes principales que se mostrarán cuando no se
          seleccione ninguna variante específica.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar">
        <FormField
          control={form.control}
          name="images_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes (relación de aspecto 3:4)</FormLabel>
              <FormControl>
                <ImageUploadDropzone
                  value={field.value || []}
                  onChange={field.onChange}
                  onValueChange={(urls, options) => {
                    // Use setValue with proper options to control dirty state
                    form.setValue("images_url", urls, {
                      shouldDirty: options?.shouldDirty ?? true,
                      shouldValidate: options?.shouldValidate ?? true,
                    });
                  }}
                  maxFiles={20}
                  productId={productId || undefined}
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
