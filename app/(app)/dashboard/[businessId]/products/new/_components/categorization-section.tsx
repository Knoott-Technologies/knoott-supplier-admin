"use client";

import { useState, useEffect, useCallback } from "react";
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
import type { Database } from "@/database.types";
import { toast } from "sonner";

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
  const [localBrands, setLocalBrands] = useState<Brand[]>(brands);
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);

  // Function to fetch data
  const fetchData = useCallback(async () => {
    try {
      // Fetch brands
      const brandsResponse = await fetch("/api/brands");
      if (brandsResponse.ok) {
        const brandsData = await brandsResponse.json();
        setLocalBrands(brandsData);
      }

      // Fetch categories
      const categoriesResponse = await fetch("/api/categories");
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setLocalCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error", {
        description: "No se pudieron cargar las marcas o categorías",
      });
    }
  }, []);

  // Refresh brands and categories when the component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle brand change
  const handleBrandChange = (brandId: number) => {
    form.setValue("brand_id", brandId);
    // If this is a new brand, refresh the data to get the latest list
    if (!localBrands.some((brand) => brand.id === brandId)) {
      fetchData();
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId: number) => {
    form.setValue("subcategory_id", categoryId);
    // If this is a new category, refresh the data to get the latest list
    if (!localCategories.some((category) => category.id === categoryId)) {
      fetchData();
    }
  };

  // Use real data if available, otherwise use mock data
  const brandsData =
    localBrands.length > 0
      ? localBrands
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
          onChange={handleBrandChange}
          placeholder="Selecciona una marca"
          searchPlaceholder="Buscar marca..."
          emptyMessage="No se encontraron marcas."
          sheetTitle="Seleccionar marca"
          sheetDescription="Selecciona la marca de tu producto."
        />

        <HierarchicalCategorySelector
          label="Categoría"
          categories={localCategories}
          value={form.watch("subcategory_id")}
          onChange={handleCategoryChange}
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
