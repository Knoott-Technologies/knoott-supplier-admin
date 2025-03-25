import { z } from "zod";

// Schema for general information step
export const generalInfoSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  short_name: z
    .string()
    .min(2, "El nombre corto debe tener al menos 2 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  short_description: z
    .string()
    .min(5, "La descripción corta debe tener al menos 5 caracteres"),
});

// Schema for images step
export const imagesSchema = z.object({
  images_url: z.array(z.string()).min(1, "Debes subir al menos una imagen"),
});

// Schema for categorization step
export const categorizationSchema = z.object({
  brand_id: z.number().nullable(),
  subcategory_id: z.number(),
});

// Schema for specifications step
export const specificationsSchema = z.object({
  dimensions: z
    .array(
      z.object({
        label: z.string().min(1, "La etiqueta es requerida"),
        value: z.string().min(1, "El valor es requerido"),
      })
    )
    .optional()
    .nullable(),
  specs: z
    .array(
      z.object({
        label: z.string().min(1, "La etiqueta es requerida"),
        value: z.string().min(1, "El valor es requerido"),
      })
    )
    .optional()
    .nullable(),
  keywords: z.array(z.string()).optional().nullable(),
});

// Schema for variant
export const variantSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  display_name: z.string().min(1, "El nombre de visualización es requerido"),
  options: z
    .array(
      z.object({
        name: z.string().min(1, "El nombre es requerido"),
        display_name: z
          .string()
          .min(1, "El nombre de visualización es requerido"),
        price: z.number().optional().nullable(),
        stock: z.number().optional().nullable(),
        is_default: z.boolean().default(false),
        sku: z.string().optional().nullable(),
        images_url: z.array(z.string()).optional().nullable(),
        metadata: z.record(z.string(), z.any()).optional().nullable(),
      })
    )
    .min(1, "Debes agregar al menos una opción"),
});

// Schema for variants step
export const variantsSchema = z.object({
  variants: z.array(variantSchema).optional(),
});

// Complete product schema
export const productSchema = generalInfoSchema
  .merge(imagesSchema)
  .merge(categorizationSchema)
  .merge(specificationsSchema);

// Types based on schemas
export type GeneralInfoFormValues = z.infer<typeof generalInfoSchema>;
export type ImagesFormValues = z.infer<typeof imagesSchema>;
export type CategorizationFormValues = z.infer<typeof categorizationSchema>;
export type SpecificationsFormValues = z.infer<typeof specificationsSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
export type VariantsFormValues = z.infer<typeof variantsSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
