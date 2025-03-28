"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { type VariantsFormValues, variantsSchema } from "@/lib/schemas";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WizardProgress } from "../_components/wizard-progress";
import { AmountInput } from "@/components/universal/amount-input";
import { ImageUploadDropzone } from "@/components/universal/image-upload-dropzone";
import { cn } from "@/lib/utils";
import { source } from "@/components/fonts/font-def";

export default function VariantsPage({
  params,
}: {
  params: { branchId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openVariants, setOpenVariants] = useState<Record<number, boolean>>({
    0: true,
  });
  const [openOptions, setOpenOptions] = useState<Record<string, boolean>>({});
  const [variantOptionIds, setVariantOptionIds] = useState<
    Record<string, string>
  >({});

  const form = useForm<VariantsFormValues>({
    resolver: zodResolver(variantsSchema),
    defaultValues: {
      variants: [
        {
          name: "",
          display_name: "",
          options: [
            {
              name: "",
              display_name: "",
              price: 0,
              stock: null,
              is_default: true,
              sku: "",
              images_url: [],
              metadata: null,
            },
          ],
        },
      ],
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Function to add a new variant
  const addVariant = () => {
    const newIndex = variantFields.length;
    appendVariant({
      name: "",
      display_name: "",
      options: [
        {
          name: "",
          display_name: "",
          price: 0,
          stock: null,
          is_default: true,
          sku: "",
          images_url: [],
          metadata: null,
        },
      ],
    });

    // Open the new variant
    setOpenVariants((prev) => ({ ...prev, [newIndex]: true }));

    // Open the first option of the new variant
    setOpenOptions((prev) => ({ ...prev, [`${newIndex}-0`]: true }));
  };

  // Function to add a new option to a variant
  const addOption = (variantIndex: number) => {
    // Usamos directamente el form para manipular las opciones
    const currentOptions =
      form.getValues(`variants.${variantIndex}.options`) || [];
    const newOptions = [
      ...currentOptions,
      {
        name: "",
        display_name: "",
        price: 0,
        stock: null,
        is_default: false,
        sku: "",
        images_url: [],
        metadata: null,
      },
    ];

    form.setValue(`variants.${variantIndex}.options`, newOptions);

    // Open the new option
    const newOptionIndex = newOptions.length - 1;
    setOpenOptions((prev) => ({
      ...prev,
      [`${variantIndex}-${newOptionIndex}`]: true,
    }));
  };

  // Function to remove an option from a variant
  const removeOption = (variantIndex: number, optionIndex: number) => {
    const currentOptions =
      form.getValues(`variants.${variantIndex}.options`) || [];
    const newOptions = currentOptions.filter(
      (_, index) => index !== optionIndex
    );

    form.setValue(`variants.${variantIndex}.options`, newOptions);

    // Remove the option from openOptions
    const newOpenOptions = { ...openOptions };
    delete newOpenOptions[`${variantIndex}-${optionIndex}`];

    // Update keys for options after the removed one
    Object.keys(newOpenOptions).forEach((key) => {
      const [vIndex, oIndex] = key.split("-").map(Number);
      if (vIndex === variantIndex && oIndex > optionIndex) {
        const isOpen = newOpenOptions[key];
        delete newOpenOptions[key];
        newOpenOptions[`${vIndex}-${oIndex - 1}`] = isOpen;
      }
    });

    setOpenOptions(newOpenOptions);
  };

  const onSubmit = async (data: VariantsFormValues) => {
    if (!productId) {
      console.error("Product ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the variants to the API
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error creating variants");
      }

      // Clear all localStorage items
      localStorage.removeItem("product_general_info");
      localStorage.removeItem("product_images");
      localStorage.removeItem("product_categorization");
      localStorage.removeItem("product_specifications");

      // Navigate to the product detail page
      router.push(`/dashboard/${params.branchId}/products/${productId}`);
    } catch (error) {
      console.error("Error saving variants:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate temporary IDs for variant options to use with image uploads
  useEffect(() => {
    const newVariantOptionIds: Record<string, string> = {};

    variantFields.forEach((variant, variantIndex) => {
      const options = form.watch(`variants.${variantIndex}.options`);
      options.forEach((_, optionIndex) => {
        const key = `${variantIndex}-${optionIndex}`;
        if (!newVariantOptionIds[key]) {
          newVariantOptionIds[key] = `temp-${Math.random()
            .toString(36)
            .substring(2, 11)}`;
        }
      });
    });

    setVariantOptionIds(newVariantOptionIds);
  }, [variantFields, form]);

  // Watch for changes in variant names to update display_name automatically
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only run this when a variant name changes
      if (name && name.includes(".name") && !name.includes(".options.")) {
        const match = name.match(/variants\.(\d+)\.name/);
        if (match && match[1]) {
          const variantIndex = Number.parseInt(match[1]);
          const variantName = value.variants?.[variantIndex]?.name;

          if (variantName) {
            // Set the display_name to "Selecciona [name]"
            form.setValue(
              `variants.${variantIndex}.display_name`,
              `Selecciona ${variantName}`
            );
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div>
      <WizardProgress
        branchId={params.branchId}
        currentProductId={productId || undefined}
      />

      <Card className="w-full">
        <CardHeader className="space-y-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Variantes del producto</CardTitle>
              <CardDescription>
                Agrega variantes de tu producto, como tallas, colores, etc.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 bg-sidebar">
          <Form {...form}>
            <form
              id="variants-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                {variantFields.map((variantField, variantIndex) => (
                  <Card key={variantField.id} className="border">
                    <Collapsible className="w-full group/collapsible">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer flex flex-row items-center justify-between border-b-0">
                          <div>
                            <CardTitle className="text-base">
                              {form.watch(`variants.${variantIndex}.name`) ||
                                `Variante ${variantIndex + 1}`}
                            </CardTitle>
                            <CardDescription>
                              {form.watch(
                                `variants.${variantIndex}.display_name`
                              ) || "Configura esta variante"}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {variantFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeVariant(variantIndex);
                                }}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <ChevronDown className="shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:-rotate-180 size-4" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="w-full border-t overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <CardContent className="space-y-4 bg-sidebar">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre de la variante</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ej. Color"
                                      className="bg-background"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.display_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre de visualización</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ej. Selecciona un color"
                                      className="bg-background"
                                      {...field}
                                      disabled
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">
                              Opciones de variante
                            </h4>

                            {form
                              .watch(`variants.${variantIndex}.options`)
                              .map((option, optionIndex) => {
                                const optionKey = `${variantIndex}-${optionIndex}`;
                                return (
                                  <Card key={optionKey} className="border">
                                    <Collapsible className="w-full group/option">
                                      <CollapsibleTrigger asChild>
                                        <CardHeader className="cursor-pointer flex flex-row items-center justify-between space-y-0 border-b-0">
                                          <div>
                                            <CardTitle
                                              className={cn(
                                                source.className,
                                                "text-sm"
                                              )}
                                            >
                                              {form.watch(
                                                `variants.${variantIndex}.options.${optionIndex}.name`
                                              ) || `Opción ${optionIndex + 1}`}
                                            </CardTitle>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {form.watch(
                                              `variants.${variantIndex}.options`
                                            ).length > 1 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  removeOption(
                                                    variantIndex,
                                                    optionIndex
                                                  );
                                                }}
                                                className="h-7 w-7 text-destructive"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            )}
                                            <ChevronDown className="shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]/option:-rotate-180 size-4" />
                                          </div>
                                        </CardHeader>
                                      </CollapsibleTrigger>

                                      <CollapsibleContent className="w-full border-t overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                        <CardContent className="space-y-4 bg-sidebar">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                              control={form.control}
                                              name={`variants.${variantIndex}.options.${optionIndex}.name`}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>
                                                    Nombre de la opción
                                                  </FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      placeholder="Ej. Rojo"
                                                      className="bg-background"
                                                      {...field}
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />

                                            <FormField
                                              control={form.control}
                                              name={`variants.${variantIndex}.options.${optionIndex}.display_name`}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>
                                                    Nombre de visualización
                                                  </FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      placeholder="Ej. Color Rojo"
                                                      className="bg-background"
                                                      {...field}
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                              control={form.control}
                                              name={`variants.${variantIndex}.options.${optionIndex}.price`}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Precio</FormLabel>
                                                  <FormControl>
                                                    <AmountInput
                                                      value={field.value || 0}
                                                      onChange={field.onChange}
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />

                                            <FormField
                                              control={form.control}
                                              name={`variants.${variantIndex}.options.${optionIndex}.stock`}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>
                                                    Inventario
                                                  </FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      type="number"
                                                      placeholder="Cantidad disponible"
                                                      className="bg-background"
                                                      {...field}
                                                      value={field.value ?? ""}
                                                      onChange={(e) =>
                                                        field.onChange(
                                                          e.target.value
                                                            ? Number.parseInt(
                                                                e.target.value
                                                              )
                                                            : null
                                                        )
                                                      }
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>

                                          <FormField
                                            control={form.control}
                                            name={`variants.${variantIndex}.options.${optionIndex}.sku`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>SKU</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    placeholder="Código de producto"
                                                    className="bg-background"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />

                                          <FormField
                                            control={form.control}
                                            name={`variants.${variantIndex}.options.${optionIndex}.images_url`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>
                                                  Imágenes de la opción
                                                </FormLabel>
                                                <FormControl>
                                                  <ImageUploadDropzone
                                                    value={field.value || []}
                                                    onChange={field.onChange}
                                                    maxFiles={4}
                                                    productId={
                                                      productId || undefined
                                                    }
                                                    variantOptionId={
                                                      variantOptionIds[
                                                        `${variantIndex}-${optionIndex}`
                                                      ]
                                                    }
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          <FormField
                                            control={form.control}
                                            name={`variants.${variantIndex}.options.${optionIndex}.is_default`}
                                            render={({ field }) => (
                                              <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-full">
                                                <FormControl>
                                                  <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                      field.onChange
                                                    }
                                                  />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                  <FormLabel>
                                                    Opción por defecto
                                                  </FormLabel>
                                                </div>
                                              </FormItem>
                                            )}
                                          />
                                        </CardContent>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </Card>
                                );
                              })}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(variantIndex)}
                              className="w-full mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar opción
                            </Button>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addVariant}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar variante
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/${params.branchId}/products/${productId}`)
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>

          <Button
            type="submit"
            variant={"defaultBlack"}
            form="variants-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Guardar variantes
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
