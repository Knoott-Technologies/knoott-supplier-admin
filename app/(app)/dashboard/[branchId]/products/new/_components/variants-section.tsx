"use client";

import React from "react";

import { useState, useEffect } from "react";
import { type UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AmountInput } from "@/components/universal/amount-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, X, ImageIcon } from "lucide-react";
import { ImageUploadDropzone } from "@/components/universal/image-upload-dropzone";

// Define types for variant options and combinations
interface VariantOption {
  name: string;
  display_name: string;
  price: number;
  stock: number | null;
  is_default: boolean;
  sku?: string;
  images_url: string[];
  metadata: any | null;
}

interface Variant {
  name: string;
  display_name: string;
  options: VariantOption[];
}

interface VariantOptionItem {
  variantName: string;
  optionName: string;
  optionValue: VariantOption;
}

interface VariantsSectionProps {
  form: UseFormReturn<any>;
  productId: string | null;
}

export default function VariantsSection({
  form,
  productId,
}: VariantsSectionProps) {
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [variantOptionIds, setVariantOptionIds] = useState<
    Record<string, string>
  >({});
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Function to add a new variant option type (e.g., Color, Size)
  const addVariant = () => {
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
  };

  // Modifica la función addOptionValue para que display_name sea igual a name
  const addOptionValue = (variantIndex: number) => {
    const currentOptions =
      form.getValues(`variants.${variantIndex}.options`) || [];

    // Get the last SKU to generate a sequential one
    let newSku = "";
    if (currentOptions.length > 0) {
      const lastSku = currentOptions[currentOptions.length - 1].sku || "";
      if (lastSku) {
        const match = lastSku.match(/(\D*)(\d+)$/);
        if (match) {
          const prefix = match[1];
          const num = Number.parseInt(match[2]) + 1;
          const padding = match[2].length;
          newSku = `${prefix}${num.toString().padStart(padding, "0")}`;
        }
      }
    }

    const newOptions = [
      ...currentOptions,
      {
        name: "",
        display_name: "", // Será actualizado cuando se cambie el name
        price: currentOptions.length > 0 ? currentOptions[0].price : 0,
        stock: null,
        is_default: false,
        sku: newSku,
        images_url: [],
        metadata: null,
      },
    ];

    form.setValue(`variants.${variantIndex}.options`, newOptions);
  };

  // Function to remove an option value from a variant
  const removeOptionValue = (variantIndex: number, optionIndex: number) => {
    const currentOptions =
      form.getValues(`variants.${variantIndex}.options`) || [];
    const newOptions = currentOptions.filter(
      (_: any, index: number) => index !== optionIndex
    );
    form.setValue(`variants.${variantIndex}.options`, newOptions);
  };

  // Function to remove a variant option type
  const removeVariantType = (variantIndex: number) => {
    removeVariant(variantIndex);
  };

  // Generate all possible combinations of variants for the table
  const generateVariantCombinations = (): VariantOptionItem[][] => {
    const variants = form.getValues("variants") || [];
    if (!variants.length) return [];

    // Get all options for each variant
    const variantOptions = variants
      .map((variant: Variant) => {
        // Make sure options exists and is an array
        const options = variant.options || [];
        return options.map((option: VariantOption) => ({
          variantName: variant.name || "",
          optionName: option.name || "",
          optionValue: option,
        }));
      })
      .filter((options: string | any[]) => options.length > 0); // Filter out empty option arrays

    // If any variant has no options, return empty array to avoid combinations issues
    if (
      variantOptions.some((options: string | any[]) => options.length === 0)
    ) {
      return [];
    }

    // Generate combinations recursively
    const generateCombinations = (
      arrays: VariantOptionItem[][],
      current: VariantOptionItem[] = [],
      index = 0
    ): VariantOptionItem[][] => {
      if (index === arrays.length) {
        return [current];
      }

      return arrays[index].flatMap((item: VariantOptionItem) =>
        generateCombinations(arrays, [...current, item], index + 1)
      );
    };

    return generateCombinations(variantOptions);
  };

  // Añade un useEffect para sincronizar name y display_name de las opciones
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Para las opciones de variante
      if (name && name.includes(".options.") && name.includes(".name")) {
        const match = name.match(/variants\.(\d+)\.options\.(\d+)\.name/);
        if (match && match[1] && match[2]) {
          const variantIndex = Number.parseInt(match[1]);
          const optionIndex = Number.parseInt(match[2]);
          const optionName =
            value.variants?.[variantIndex]?.options?.[optionIndex]?.name;

          if (optionName) {
            // Actualiza display_name para que sea igual a name
            form.setValue(
              `variants.${variantIndex}.options.${optionIndex}.display_name`,
              optionName
            );
          }
        }
      }

      // Para las variantes (mantener el código existente)
      if (name && name.includes(".name") && !name.includes(".options.")) {
        const match = name.match(/variants\.(\d+)\.name/);
        if (match && match[1]) {
          const variantIndex = Number.parseInt(match[1]);
          const variantName = value.variants?.[variantIndex]?.name;

          if (variantName) {
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

  // Generate temporary IDs for variant options
  useEffect(() => {
    const newVariantOptionIds: Record<string, string> = {};

    variantFields.forEach((variant, variantIndex) => {
      // Type assertion to access the name property
      const typedVariant = variant as unknown as { id: string; name?: string };

      const options = form.watch(`variants.${variantIndex}.options`);
      options.forEach((_: any, optionIndex: number) => {
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

  // Función para generar SKUs secuenciales basados en el primer SKU
  const generateSequentialSKUs = (baseSku: string, variantIndex: number) => {
    // Solo proceder si hay opciones
    const options = form.getValues(`variants.${variantIndex}.options`) || [];
    if (!options.length) return;

    // Encontrar un patrón numérico al final del SKU
    const match = baseSku.match(/(\D*)(\d+)$/);
    if (!match) return; // No hay patrón numérico al final

    const prefix = match[1]; // Parte no numérica
    let counter = Number.parseInt(match[2]); // Parte numérica
    const padding = match[2].length; // Cantidad de dígitos para mantener el formato

    // Aplicar SKUs secuenciales a partir del segundo elemento
    options.slice(1).forEach((_: any, idx: number) => {
      // Incrementar el contador y formatear con ceros a la izquierda
      counter++;
      const newSku = `${prefix}${counter.toString().padStart(padding, "0")}`;

      // Establecer el nuevo SKU
      form.setValue(`variants.${variantIndex}.options.${idx + 1}.sku`, newSku);
    });
  };

  // Get all variant combinations for the table
  const variantCombinations = generateVariantCombinations();

  // Function to toggle expanded variant for image management
  const toggleExpandedVariant = (key: string) => {
    if (expandedVariant === key) {
      setExpandedVariant(null);
    } else {
      setExpandedVariant(key);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variantes del producto</CardTitle>
        <CardDescription>
          Agrega variantes de tu producto, como tallas, colores, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar space-y-6">
        {/* Variant Options Section */}
        {variantFields.map((variantField, variantIndex) => (
          <Card key={variantField.id} className="border">
            <CardContent className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between gap-4">
                <FormField
                  control={form.control}
                  name={`variants.${variantIndex}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Nombre de la opción</FormLabel>
                      <FormControl>
                        <div className="w-full h-fit items-center justify-between flex gap-4">
                          <Input
                            placeholder="Ej. Color, Talla, Material"
                            className="bg-sidebar"
                            {...field}
                          />
                          <div className="flex items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeVariantType(variantIndex)}
                              className="h-8 w-8 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full">
                {form
                  .watch(`variants.${variantIndex}.options`)
                  .map((option: VariantOption, optionIndex: number) => (
                    <div
                      key={optionIndex}
                      className="flex items-center gap-1 pl-3 pr-1 py-1.5 bg-sidebar border w-fit flex-none max-w-fit"
                    >
                      <FormField
                        control={form.control}
                        name={`variants.${variantIndex}.options.${optionIndex}.name`}
                        render={({ field }) => (
                          <Input
                            className="w-fit border-none p-0 h-auto max-w-fit text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Valor"
                            {...field}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeOptionValue(variantIndex, optionIndex)
                        }
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addOptionValue(variantIndex)}
                  className="text-sm text-muted-foreground"
                >
                  Añadir valor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addVariant}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir otra opción
        </Button>

        {/* Variant Combinations Table */}
        {variantCombinations.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Variantes</h3>
            </div>

            <div className="border bg-background overflow-hidden rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          selectedVariants.length === variantCombinations.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedVariants(
                              Array.from(
                                { length: variantCombinations.length },
                                (_, i) => i
                              )
                            );
                          } else {
                            setSelectedVariants([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead className="w-[200px]">Precio</TableHead>
                    <TableHead className="w-[150px]">Disponible</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variantCombinations.map((combination, index: number) => {
                    // Get the first option to use for form field references
                    const firstOption = combination[0];
                    if (!firstOption) return null; // Skip if no option is found

                    // Find the variant index by name
                    const variantIndex = variantFields.findIndex((v) => {
                      // Get the variant name from the form values instead of the field
                      const variantName = form.getValues(
                        `variants.${variantFields.indexOf(v)}.name`
                      );
                      return variantName === firstOption.variantName;
                    });

                    // If variant not found, skip this combination
                    if (variantIndex === -1) return null;

                    // Get options array with null check
                    const options =
                      form.getValues(`variants.${variantIndex}.options`) || [];

                    // Find the option index by name
                    const optionIndex = options.findIndex(
                      (o: VariantOption) => o?.name === firstOption.optionName
                    );

                    // If option not found, skip this combination
                    if (optionIndex === -1) return null;

                    // Get the current images for this variant option
                    const images =
                      form.getValues(
                        `variants.${variantIndex}.options.${optionIndex}.images_url`
                      ) || [];

                    // Create a unique key for this variant option
                    const variantKey = `${variantIndex}-${optionIndex}`;
                    const isExpanded = expandedVariant === variantKey;

                    return (
                      <React.Fragment key={index}>
                        <TableRow>
                          <TableCell>
                            <Checkbox
                              checked={selectedVariants.includes(index)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedVariants([
                                    ...selectedVariants,
                                    index,
                                  ]);
                                } else {
                                  setSelectedVariants(
                                    selectedVariants.filter((i) => i !== index)
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div
                                className="w-[100px] h-[100px] border border-dashed rounded-md flex items-center justify-center cursor-pointer bg-muted/30"
                                onClick={() =>
                                  toggleExpandedVariant(variantKey)
                                }
                              >
                                {images.length > 0 ? (
                                  <img
                                    src={images[0] || "/placeholder.svg"}
                                    alt={`Imagen de ${firstOption.optionName}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {combination
                                    .map(
                                      (item: VariantOptionItem) =>
                                        item.optionName
                                    )
                                    .join(" / ")}
                                </span>
                                <FormField
                                  control={form.control}
                                  name={`variants.${variantIndex}.options.${optionIndex}.sku`}
                                  render={({ field }) => (
                                    <Input
                                      placeholder="SKU"
                                      className="mt-1 h-8 text-sm text-muted-foreground"
                                      {...field}
                                      value={field.value || ""}
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        // Si es la primera opción de esta variante y se cambió el SKU, generar SKUs secuenciales
                                        if (
                                          optionIndex === 0 &&
                                          e.target.value
                                        ) {
                                          generateSequentialSKUs(
                                            e.target.value,
                                            variantIndex
                                          );
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.options.${optionIndex}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="relative">
                                      <AmountInput
                                        className="bg-sidebar pl-8"
                                        value={field.value || 0}
                                        onChange={field.onChange}
                                      />
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                        $
                                      </span>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="w-fit">
                            <FormField
                              control={form.control}
                              name={`variants.${variantIndex}.options.${optionIndex}.stock`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      className="bg-sidebar w-full"
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value
                                            ? Number.parseInt(e.target.value)
                                            : null
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0 border-t-0">
                              <div className="p-4 bg-muted/20">
                                <FormField
                                  control={form.control}
                                  name={`variants.${variantIndex}.options.${optionIndex}.images_url`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Imágenes de la variante
                                      </FormLabel>
                                      <FormControl>
                                        <ImageUploadDropzone
                                          value={field.value || []}
                                          onChange={field.onChange}
                                          maxFiles={5}
                                          productId={productId || undefined}
                                          variantOptionId={
                                            variantOptionIds[variantKey] ||
                                            undefined
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground text-center">
              Inventario total:{" "}
              {variantCombinations.reduce((total, combination) => {
                const firstOption = combination[0];
                if (!firstOption) return total;

                const variantIndex = variantFields.findIndex((v) => {
                  const variantName = form.getValues(
                    `variants.${variantFields.indexOf(v)}.name`
                  );
                  return variantName === firstOption.variantName;
                });

                if (variantIndex === -1) return total;

                const options =
                  form.getValues(`variants.${variantIndex}.options`) || [];
                const optionIndex = options.findIndex(
                  (o: VariantOption) => o?.name === firstOption.optionName
                );

                if (optionIndex === -1) return total;

                const stock =
                  form.getValues(
                    `variants.${variantIndex}.options.${optionIndex}.stock`
                  ) || 0;
                return total + (stock || 0);
              }, 0)}{" "}
              disponible
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
