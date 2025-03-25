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
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [isLoading, setIsLoading] = useState(true);
  const [openBrand, setOpenBrand] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

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
      } finally {
        setIsLoading(false);
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
              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Marca</FormLabel>
                    <Popover open={openBrand} onOpenChange={setOpenBrand}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openBrand}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? brandsData.find(
                                  (brand) => brand.id === field.value
                                )?.name
                              : "Selecciona una marca"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar marca..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron marcas.
                            </CommandEmpty>
                            <CommandGroup>
                              {brandsData.map((brand) => (
                                <CommandItem
                                  key={brand.id}
                                  value={brand.name}
                                  onSelect={() => {
                                    form.setValue("brand_id", brand.id);
                                    setOpenBrand(false);
                                  }}
                                >
                                  {brand.name}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === brand.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Categoría</FormLabel>
                    <Popover open={openCategory} onOpenChange={setOpenCategory}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCategory}
                            className="w-full justify-between"
                          >
                            {categoriesData.find(
                              (category) => category.id === field.value
                            )?.name || "Selecciona una categoría"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar categoría..."
                            className="h-9"
                          />
                          <CommandList>
                            <CommandEmpty>
                              No se encontraron categorías.
                            </CommandEmpty>
                            <CommandGroup>
                              {categoriesData.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={() => {
                                    form.setValue(
                                      "subcategory_id",
                                      category.id
                                    );
                                    setOpenCategory(false);
                                  }}
                                >
                                  {category.name}
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === category.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
