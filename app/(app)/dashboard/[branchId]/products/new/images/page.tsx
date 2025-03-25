"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImagesFormValues, imagesSchema } from "@/lib/schemas";
import { WizardProgress } from "../_components/wizard-progress";
import { ImageUploadDropzone } from "@/components/universal/image-upload-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function ImagesPage({
  params,
}: {
  params: { branchId: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ImagesFormValues>({
    resolver: zodResolver(imagesSchema),
    defaultValues: {
      images_url: [],
    },
  });

  // Load saved data if available
  useEffect(() => {
    const savedImages = localStorage.getItem("product_images");
    if (savedImages) {
      try {
        const parsedImages = JSON.parse(savedImages);
        form.reset(parsedImages);
      } catch (error) {
        console.error("Error parsing saved images:", error);
      }
    }
  }, [form]);

  const onSubmit = async (data: ImagesFormValues) => {
    setIsSubmitting(true);

    try {
      // Store the data in localStorage for now
      localStorage.setItem("product_images", JSON.stringify(data));

      // Navigate to the next step
      router.push(`/dashboard/${params.branchId}/products/new/categorization`);
    } catch (error) {
      console.error("Error saving images:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/dashboard/${params.branchId}/products/new/general-info`);
  };

  return (
    <div>
      <WizardProgress branchId={params.branchId} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Imágenes del producto</CardTitle>
          <CardDescription>Agrega las imagenes del producto.</CardDescription>
        </CardHeader>

        <CardContent className="bg-sidebar">
          <Form {...form}>
            <form
              id="images-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
                        maxFiles={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft />
              Atrás
            </Button>
            <Button
              form="images-form"
              variant={"defaultBlack"}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
