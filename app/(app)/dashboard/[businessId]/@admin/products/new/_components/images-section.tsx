"use client";

import { UseFormReturn } from "react-hook-form";
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
}

export default function ImagesSection({ form }: ImagesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Imágenes del producto</CardTitle>
        <CardDescription>Agrega las imagenes del producto.</CardDescription>
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
                  value={field.value}
                  onChange={field.onChange}
                  maxFiles={20}
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
