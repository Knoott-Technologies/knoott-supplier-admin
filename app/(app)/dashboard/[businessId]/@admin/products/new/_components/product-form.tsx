"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import GeneralInfoSection from "./general-info-section";
import ImagesSection from "./images-section";
import CategorizationSection from "./categorization-section";
import SpecificationsSection from "./specifications-section";
import VariantsSection from "./variants-section";
import ShippingSection from "./shipping-section";
import NoVariantsSection from "./no-variants-section";
import type { Database } from "@/database.types";

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

  // Shipping
  shipping_cost: z.number().default(0),

  // Single product (no variants)
  single_price: z.number().optional(),
  single_stock: z.number().nullable().optional(),
  single_sku: z.string().optional(),
  single_commission: z.number().optional(),

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
              accorded_commision: z.number().default(0.085),
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

type Business = Database["public"]["Tables"]["provider_business"]["Row"];

interface ProductFormProps {
  businessId: string;
  brands: Brand[];
  categories: Category[];
  business: Business;
}

export default function ProductForm({
  businessId,
  brands,
  categories,
  business,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [hasVariants, setHasVariants] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      short_name: "",
      description: "",
      short_description: "",
      images_url: [],
      brand_id: null,
      subcategory_id: null,
      dimensions: [],
      specs: [],
      keywords: [],
      shipping_cost: 0,
      single_price: 0,
      single_stock: null,
      single_sku: "",
      single_commission: business.commission_percentage || 0.085,
      variants: [],
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Create the complete product object
      const product = {
        ...data,
        status: "requires_verification",
        provider_business_id: businessId,
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
      const newProductId = result.id;
      setProductId(newProductId);

      // If we have images, we need to move them to the proper location
      if (data.images_url && data.images_url.length > 0) {
        // Call an API to move the images
        await fetch(`/api/products/${newProductId}/move-images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            images: data.images_url,
            productId: newProductId.toString(),
          }),
        });
      }

      // Handle variants or single product
      if (hasVariants && data.variants && data.variants.length > 0) {
        // Create variants
        await fetch(`/api/products/${newProductId}/variants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variants: data.variants }),
        });
      } else if (!hasVariants) {
        // Create a default variant for a product without variants
        const defaultVariant = {
          name: "Default",
          display_name: "Default",
          options: [
            {
              name: "Default",
              display_name: "Default",
              price: data.single_price || 0,
              stock: data.single_stock,
              is_default: true,
              sku: data.single_sku || "",
              images_url: data.images_url || [],
              metadata: null,
              accorded_commission: data.single_commission || 0.085,
            },
          ],
        };

        await fetch(`/api/products/${newProductId}/variants`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variants: [defaultVariant] }),
        });
      }

      // Navigate to the product detail page
      router.push(`/dashboard/${businessId}/products/${newProductId}`);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          id="product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5 lg:gap-y-7 max-w-5xl mx-auto px-3 md:px-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-5 lg:gap-y-7">
            <section className="w-full flex flex-col gap-y-5 lg:gap-y-7">
              <GeneralInfoSection form={form} />
              <ImagesSection form={form} />
              <SpecificationsSection form={form} />
              <ShippingSection form={form} />
              <NoVariantsSection
                form={form}
                productId={productId}
                commission={business.commission_percentage!}
                hasVariants={hasVariants}
                onToggleVariants={setHasVariants}
              />
              {hasVariants && (
                <VariantsSection
                  commission={business.commission_percentage!}
                  form={form}
                  productId={productId}
                />
              )}
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
          onClick={() => router.push(`/dashboard/${businessId}/products`)}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size={"sm"}
          variant="defaultBlack"
          form="product-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>Guardar Producto</>
          )}
        </Button>
      </div>
    </>
  );
}
