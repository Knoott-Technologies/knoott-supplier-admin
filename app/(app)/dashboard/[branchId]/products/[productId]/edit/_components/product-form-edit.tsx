"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Database } from "@/database.types";
import GeneralInfoSection from "../../../new/_components/general-info-section";
import ImagesSection from "../../../new/_components/images-section";
import SpecificationsSection from "../../../new/_components/specifications-section";
import VariantsSection from "../../../new/_components/variants-section";
import CategorizationSection from "../../../new/_components/categorization-section";

// Define the combined schema for all form sections
const productFormSchema = z.object({
  // General Info
  name: z.string().min(1, "El nombre es requerido"),
  short_name: z.string().min(1, "El nombre corto es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  short_description: z.string().min(1, "La descripción corta es requerida"),

  // Images
  images_url: z.array(z.string()).min(1, "Al menos una imagen es requerida"),

  // Categorization
  brand_id: z.number().nullable(),
  subcategory_id: z.number().nullable(),

  // Specifications
  dimensions: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
  specs: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
  keywords: z.array(z.string()).optional().default([]),

  // Variants
  variants: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre de la variante es requerido"),
        display_name: z
          .string()
          .min(1, "El nombre de visualización es requerido"),
        options: z
          .array(
            z.object({
              name: z.string().min(1, "El nombre de la opción es requerido"),
              display_name: z.string().optional(),
              price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
              stock: z.number().nullable(),
              is_default: z.boolean().default(false),
              sku: z.string().optional(),
              images_url: z.array(z.string()).default([]),
              metadata: z.any().nullable(),
            })
          )
          .min(1, "Al menos una opción es requerida"),
      })
    )
    .optional()
    .default([]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

type Brand = Database["public"]["Tables"]["catalog_brands"]["Row"];
type Category = Database["public"]["Tables"]["catalog_collections"]["Row"];

interface ProductFormEditProps {
  product: any;
  variants: any[];
  variantOptions: any[];
  brands: Brand[];
  categories: Category[];
}

export default function ProductFormEdit({
  product,
  variants,
  variantOptions,
  brands,
  categories,
}: ProductFormEditProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Process dimensions and specs from JSON to array format
  const processDimensions = () => {
    if (!product.dimensions) return [];
    return Object.entries(product.dimensions).map(([label, value]) => ({
      label,
      value: value as string,
    }));
  };

  const processSpecs = () => {
    if (!product.specs) return [];
    return Object.entries(product.specs).map(([label, value]) => ({
      label,
      value: value as string,
    }));
  };

  // Process variants and options
  const processVariants = () => {
    if (!variants || variants.length === 0) return [];

    return variants.map((variant) => {
      const options = variantOptions
        .filter((option) => option.variant_id === variant.id)
        .map((option) => ({
          name: option.name,
          display_name: option.display_name,
          price: option.price,
          stock: option.stock,
          is_default: option.is_default,
          sku: option.sku,
          images_url: option.images_url || [],
          metadata: option.metadata,
        }));

      return {
        name: variant.name,
        display_name: variant.display_name,
        options,
      };
    });
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      short_name: product?.short_name || "",
      description: product?.description || "",
      short_description: product?.short_description || "",
      images_url: product?.images_url || [],
      brand_id: product?.brand_id || null,
      subcategory_id: product?.subcategory_id || null,
      dimensions: processDimensions(),
      specs: processSpecs(),
      keywords: product?.keywords || [],
      variants: processVariants(),
    },
  });

  // Update form values when product data changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        short_name: product.short_name || "",
        description: product.description || "",
        short_description: product.short_description || "",
        images_url: product.images_url || [],
        brand_id: product.brand_id || null,
        subcategory_id: product.subcategory_id || null,
        dimensions: processDimensions(),
        specs: processSpecs(),
        keywords: product.keywords || [],
        variants: processVariants(),
      });
    }
  }, [product, variants, variantOptions]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Create the complete product object
      const updatedProduct = {
        ...data,
        status: product.status, // Maintain the current status
        provider_branch_id: product.provider_branch_id,
      };

      // Submit the product to the API
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error("Error updating product");
      }

      const result = await response.json();

      // If we have images, we need to move them to the proper location
      if (data.images_url && data.images_url.length > 0) {
        // Call an API to move the images
        await fetch(`/api/products/${product.id}/move-images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: data.images_url,
            productId: product.id.toString(),
          }),
        });
      }

      // Update variants
      if (data.variants && data.variants.length > 0) {
        await fetch(`/api/products/${product.id}/variants`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variants: data.variants }),
        });
      }

      // Navigate to the product detail page
      router.push(
        `/dashboard/${product.provider_branch_id}/products/${product.id}`
      );
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5 lg:gap-y-7 max-w-5xl mx-auto px-3 md:px-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:gap-y-7">
            <section className="w-full flex flex-col gap-y-5 lg:gap-y-7">
              <GeneralInfoSection form={form} />
              <ImagesSection form={form} />
              <SpecificationsSection form={form} />
              <VariantsSection form={form} productId={product?.id} />
            </section>
            <section className="w-full h-fit items-start justify-start flex flex-col lg:sticky lg:top-[calc(56px_+_28px)]">
              <CategorizationSection
                form={form}
                brands={brands}
                categories={categories}
              />
            </section>
          </div>
        </form>
      </Form>
      <div className="flex justify-end gap-2 sticky bottom-0 px-3 py-2 bg-sidebar border-t mt-7 lg:mt-14">
        <Button
          type="button"
          variant="outline"
          size={"sm"}
          onClick={() =>
            router.push(`/dashboard/${product.provider_branch_id}/products`)
          }
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size={"sm"}
          variant="defaultBlack"
          disabled={isSubmitting}
          onClick={form.handleSubmit(onSubmit)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>Actualizar Producto</>
          )}
        </Button>
      </div>
    </>
  );
}
