"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import {
  type CategorizationFormValues,
  categorizationSchema,
} from "@/lib/schemas";
import { WizardProgress } from "../_components/wizard-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ResponsiveSelector from "@/components/universal/responsive-selector";

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

export default function CategorizationPage({
  params,
}: {
  params: { branchId: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<CategorizationFormValues>({
    resolver: zodResolver(categorizationSchema),
    defaultValues: {
      brand_id: null,
      subcategory_id: undefined, // Default value as specified in the schema
    },
  });

  // Load saved data if available
  useEffect(() => {
    const savedCategorization = localStorage.getItem("product_categorization");
    if (savedCategorization) {
      try {
        const parsedCategorization = JSON.parse(savedCategorization);
        form.reset(parsedCategorization);
      } catch (error) {
        console.error("Error parsing saved categorization:", error);
      }
    }

    // Fetch brands and categories
    const fetchData = async () => {
      try {
        // Fetch brands
        const brandsResponse = await fetch("/api/catalog/brands");
        const brandsData = await brandsResponse.json();
        setBrands(brandsData);

        // Fetch categories
        const categoriesResponse = await fetch("/api/catalog/categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [form]);

  const onSubmit = async (data: CategorizationFormValues) => {
    setIsSubmitting(true);

    try {
      // Store the data in localStorage for now
      localStorage.setItem("product_categorization", JSON.stringify(data));

      // Navigate to the next step
      router.push(`/dashboard/${params.branchId}/products/new/specifications`);
    } catch (error) {
      console.error("Error saving categorization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/dashboard/${params.branchId}/products/new/images`);
  };

  // Mock data for demonstration
  const mockBrands: Brand[] = [
    { id: 1, name: "Nike" },
    { id: 2, name: "Adidas" },
    { id: 3, name: "Puma" },
    { id: 4, name: "Under Armour" },
  ];

  const mockCategories: Category[] = [
    { id: 1, name: "Ropa" },
    { id: 2, name: "Calzado" },
    { id: 3, name: "Accesorios" },
    { id: 4, name: "Electrónicos" },
  ];

  // Use real data if available, otherwise use mock data
  const brandsData = brands.length > 0 ? brands : mockBrands;
  const categoriesData = categories.length > 0 ? categories : mockCategories;

  return (
    <div>
      <WizardProgress branchId={params.branchId} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Categorización del producto</CardTitle>
          <CardDescription>
            Selecciona la marca y categoría del producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full bg-sidebar">
          <Form {...form}>
            <form
              id="category-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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

              <ResponsiveSelector
                label="Categoría"
                items={categoriesData}
                value={form.watch("subcategory_id")}
                onChange={(value) => form.setValue("subcategory_id", value)}
                placeholder="Selecciona una categoría"
                searchPlaceholder="Buscar categoría..."
                emptyMessage="No se encontraron categorías."
                sheetTitle="Seleccionar categoría"
                sheetDescription="Selecciona la categoría que mejor se adapte a tu producto."
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="border-t">
          <div className="flex justify-between w-full">
            <Button type="button" variant="ghost" onClick={goBack}>
              <ArrowLeft />
              Atrás
            </Button>
            <Button
              type="submit"
              variant={"defaultBlack"}
              form="category-form"
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
