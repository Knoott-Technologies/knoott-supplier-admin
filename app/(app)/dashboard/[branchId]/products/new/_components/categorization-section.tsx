"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ResponsiveSelector from "@/components/universal/responsive-selector";
import HierarchicalCategorySelector from "@/components/universal/hierarchical-category-selector";
import { Database } from "@/database.types";

interface Brand {
  id: number;
  name: string;
}

type Category = Database["public"]["Tables"]["catalog_collections"]["Row"];

interface CategorizationSectionProps {
  form: UseFormReturn<any>;
  brands: Brand[];
  categories: Category[];
}

export default function CategorizationSection({
  form,
  brands,
  categories,
}: CategorizationSectionProps) {
  // Use real data if available, otherwise use mock data
  const brandsData =
    brands.length > 0
      ? brands
      : [
          { id: 1, name: "Nike" },
          { id: 2, name: "Adidas" },
          { id: 3, name: "Puma" },
          { id: 4, name: "Under Armour" },
        ];

  return (
    <Card className="w-full h-fit">
      <CardHeader>
        <CardTitle>Categorización del producto</CardTitle>
        <CardDescription>
          Selecciona la marca y categoría del producto.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar space-y-4">
        <ResponsiveSelector
          label="Marca"
          items={brandsData}
          value={form.watch("brand_id")}
          onChange={(value) => form.setValue("brand_id", value)}
          placeholder="Selecciona una marca"
          searchPlaceholder="Buscar marca..."
          emptyMessage="No se encontraron marcas."
          sheetTitle="Seleccionar marca"
          sheetDescription="Selecciona la marca de tu producto."
        />

        <HierarchicalCategorySelector
          label="Categoría"
          categories={categories}
          value={form.watch("subcategory_id")}
          onChange={(value) => form.setValue("subcategory_id", value)}
          placeholder="Selecciona una categoría"
          searchPlaceholder="Buscar categoría..."
          emptyMessage="No se encontraron categorías."
          sheetTitle="Seleccionar categoría"
          sheetDescription="Selecciona la categoría que mejor se adapte a tu producto."
        />
      </CardContent>
    </Card>
  );
}
