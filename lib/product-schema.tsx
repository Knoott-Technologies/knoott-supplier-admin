import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional().default(""),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  original_price: z.number().optional(),
  sku: z.string().min(1, "El SKU es requerido"),
  brand: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  images: z.array(z.string().url("Debe ser una URL válida")),
  attributes: z.record(z.string(), z.string()),
  variants: z
    .array(
      z.object({
        name: z.string(),
        options: z.array(z.string()),
      })
    )
    .optional(),
  stock: z.number().optional(),
  url: z.string().url("Debe ser una URL válida"),
  extracted_at: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;
