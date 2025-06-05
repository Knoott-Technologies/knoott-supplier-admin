"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import type { Database } from "@/database.types";
import { toast } from "sonner";
import GeneralInfoSection from "../../../new/_components/general-info-section";
import ImagesSection from "../../../new/_components/images-section";
import SpecificationsSection from "../../../new/_components/specifications-section";
import NoVariantsSection from "../../../new/_components/no-variants-section";
import VariantsSection from "../../../new/_components/variants-section";
import ShippingSection from "../../../new/_components/shipping-section";
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
              images_url: z.array(z.string()).default([]), // Array of images for variant options
              metadata: z.any().nullable(),
              accorded_commission: z.number().optional(),
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
  commission: number;
}

export default function ProductFormEdit({
  product,
  variants,
  variantOptions,
  brands,
  categories,
  commission,
}: ProductFormEditProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(product?.hasVariants === true);

  // Process dimensions and specs from JSON to array format
  const processDimensions = () => {
    if (!product.dimensions) return [];
    try {
      // Si dimensions es un array (como viene del form), devolverlo directamente
      if (Array.isArray(product.dimensions)) {
        return product.dimensions.map(
          (dim: { label: any; value: { toString: () => any } }) => ({
            label: dim.label || "",
            value:
              typeof dim.value === "number"
                ? dim.value.toString()
                : dim.value || "",
          })
        );
      }

      if (typeof product.dimensions === "string") {
        const parsed = JSON.parse(product.dimensions);
        return Object.entries(parsed).map(([label, value]) => ({
          label,
          value:
            typeof value === "number" ? value.toString() : (value as string),
        }));
      }

      if (typeof product.dimensions === "object") {
        return Object.entries(product.dimensions).map(([label, value]) => ({
          label,
          value:
            typeof value === "number" ? value.toString() : (value as string),
        }));
      }

      return [];
    } catch (error) {
      console.error("Error processing dimensions:", error);
      return [];
    }
  };

  const processSpecs = () => {
    if (!product.specs) return [];
    try {
      // Si specs es un array (como viene del form), devolverlo directamente
      if (Array.isArray(product.specs)) {
        return product.specs.map(
          (spec: { label: any; value: { toString: () => any } }) => ({
            label: spec.label || "",
            value:
              typeof spec.value === "number"
                ? spec.value.toString()
                : spec.value || "",
          })
        );
      }

      if (typeof product.specs === "string") {
        const parsed = JSON.parse(product.specs);
        return Object.entries(parsed).map(([label, value]) => ({
          label,
          value:
            typeof value === "number" ? value.toString() : (value as string),
        }));
      }

      if (typeof product.specs === "object") {
        return Object.entries(product.specs).map(([label, value]) => ({
          label,
          value:
            typeof value === "number" ? value.toString() : (value as string),
        }));
      }

      return [];
    } catch (error) {
      console.error("Error processing specs:", error);
      return [];
    }
  };

  // Process variants and options - Fixed logic
  const processVariants = () => {
    // If no variants or explicitly marked as no variants, return empty array
    if (!variants || variants.length === 0 || product?.hasVariants === false) {
      return [];
    }

    // Check if this is a default variant (single product)
    if (
      variants.length === 1 &&
      variants[0].name === "Default" &&
      variantOptions.length <= 1 &&
      (variantOptions.length === 0 || variantOptions[0]?.name === "Default")
    ) {
      return [];
    }

    // Process real variants
    const processedVariants = variants.map((variant) => {
      const options = variantOptions
        .filter((option) => option.variant_id === variant.id)
        .map((option) => ({
          name: option.name || "",
          display_name: option.display_name || option.name || "",
          price: option.price || 0,
          stock: option.stock,
          is_default: option.is_default || false,
          sku: option.sku || "",
          images_url: option.images_url || [], // Keep as array for variant option images
          metadata: option.metadata,
          accorded_commission: option.accorded_commission || commission,
        }));

      return {
        name: variant.name || "",
        display_name: variant.display_name || variant.name || "",
        options,
      };
    });

    return processedVariants;
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
      shipping_cost: product?.shipping_cost || 0,
      single_price: product?.single_price || 0,
      single_stock: product?.single_stock || null,
      single_sku: product?.single_sku || "",
      single_commission: product?.single_commission || commission,
      variants: processVariants(),
    },
  });

  // Update form values when product data changes
  useEffect(() => {
    if (product) {
      const processedVariants = processVariants();
      const shouldHaveVariants = processedVariants.length > 0;

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
        shipping_cost: product.shipping_cost || 0,
        single_price: product.single_price || 0,
        single_stock: product.single_stock || null,
        single_sku: product.single_sku || "",
        single_commission: product.single_commission || commission,
        variants: processedVariants,
      });

      setHasVariants(shouldHaveVariants);
    }
  }, [product, variants, variantOptions, commission]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);

    try {
      // Create the complete product object
      const updatedProduct = {
        ...data,
        status: product.status, // Maintain the current status
        provider_business_id: product.provider_business_id,
        hasVariants: hasVariants,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error updating product");
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
      if (hasVariants && data.variants && data.variants.length > 0) {
        const variantsResponse = await fetch(
          `/api/products/${product.id}/variants`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ variants: data.variants }),
          }
        );

        if (!variantsResponse.ok) {
          throw new Error("Error updating variants");
        }
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
              accorded_commission: data.single_commission || commission,
            },
          ],
        };

        const variantsResponse = await fetch(
          `/api/products/${product.id}/variants`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ variants: [defaultVariant] }),
          }
        );

        if (!variantsResponse.ok) {
          throw new Error("Error updating default variant");
        }
      }

      toast.success("Producto actualizado", {
        description: "El producto ha sido actualizado correctamente",
      });

      // Navigate to the product detail page
      router.push(
        `/dashboard/${product.provider_business_id}/products/${product.id}`
      );
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar el producto", {
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error al actualizar el producto",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          id="product-form-edit"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-5 lg:gap-y-7 max-w-5xl mx-auto px-3 md:px-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:gap-y-7">
            <section className="w-full flex flex-col gap-y-5 lg:gap-y-7">
              <GeneralInfoSection form={form} />
              {/* Only show ImagesSection when hasVariants is true */}
              <ImagesSection
                form={form}
                productId={product?.id}
                hasVariants={hasVariants}
              />
              <SpecificationsSection form={form} />
              <NoVariantsSection
                form={form}
                productId={product?.id}
                commission={commission}
                hasVariants={hasVariants}
                onToggleVariants={setHasVariants}
              />
              {hasVariants && (
                <VariantsSection
                  commission={commission}
                  form={form}
                  productId={product?.id}
                />
              )}
              <ShippingSection form={form} />
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
            router.push(`/dashboard/${product.provider_business_id}/products`)
          }
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size={"sm"}
          variant="defaultBlack"
          disabled={isSubmitting}
          form="product-form-edit"
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
