"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SpecificationsFormValues, specificationsSchema } from "@/lib/schemas";
import { WizardProgress } from "../_components/wizard-progress";
import { JsonFieldArray } from "@/components/universal/json-field-array";
import { KeywordInput } from "@/components/universal/keyword-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function SpecificationsPage({
  params,
}: {
  params: { branchId: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpecificationsFormValues>({
    resolver: zodResolver(specificationsSchema),
    defaultValues: {
      dimensions: [],
      specs: [],
      keywords: [],
    },
  });

  // Load saved data if available
  useEffect(() => {
    const savedSpecifications = localStorage.getItem("product_specifications");
    if (savedSpecifications) {
      try {
        const parsedSpecifications = JSON.parse(savedSpecifications);
        form.reset(parsedSpecifications);
      } catch (error) {
        console.error("Error parsing saved specifications:", error);
      }
    }
  }, [form]);

  const onSubmit = async (data: SpecificationsFormValues) => {
    setIsSubmitting(true);

    try {
      // Store the data in localStorage for now
      localStorage.setItem("product_specifications", JSON.stringify(data));

      // Combine all the data from previous steps
      const generalInfo = JSON.parse(
        localStorage.getItem("product_general_info") || "{}"
      );
      const images = JSON.parse(localStorage.getItem("product_images") || "{}");
      const categorization = JSON.parse(
        localStorage.getItem("product_categorization") || "{}"
      );

      // Create the complete product object
      const product = {
        ...generalInfo,
        ...images,
        ...categorization,
        ...data,
        status: "draft",
        provider_branch_id: params.branchId,
      };

      // Submit the product to the API
      const response = await fetch("/api/products/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error("Error creating product");
      }

      const result = await response.json();

      // If we have temporary images, we need to move them to the proper location
      if (images.images_url && images.images_url.length > 0) {
        // Call an API to move the images
        await fetch(`/api/products/${result.id}/move-images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: images.images_url,
            productId: result.id.toString(),
          }),
        });
      }

      // Navigate to the variants step with the new product ID
      router.push(
        `/dashboard/${params.branchId}/products/new/variants?productId=${result.id}`
      );
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/dashboard/${params.branchId}/products/new/categorization`);
  };

  return (
    <div>
      <WizardProgress branchId={params.branchId} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Especificaciones del producto</CardTitle>
          <CardDescription>
            Define las dimensiones y especificaciones del producto.
          </CardDescription>
        </CardHeader>

        <CardContent className="bg-sidebar">
          <Form {...form}>
            <form id="specifications-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        Agrega palabras clave, ayuda a mejorar el rendimiento de
                        tu producto
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
              type="submit"
              form="specifications-form"
              variant={"defaultBlack"}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  Finalizar y crear producto
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
