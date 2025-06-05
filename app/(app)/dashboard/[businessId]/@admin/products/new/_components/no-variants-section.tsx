"use client";

import type { UseFormReturn } from "react-hook-form";
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
import { AmountInput } from "@/components/universal/amount-input";
import { Switch } from "@/components/ui/switch";
import { ImageUploadDropzone } from "@/components/universal/image-upload-dropzone";
import { Separator } from "@/components/ui/separator";

interface NoVariantsSectionProps {
  form: UseFormReturn<any>;
  productId: string | null;
  commission: number;
  hasVariants: boolean;
  onToggleVariants: (hasVariants: boolean) => void;
}

export default function NoVariantsSection({
  form,
  productId,
  commission,
  hasVariants,
  onToggleVariants,
}: NoVariantsSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Información de producto</CardTitle>
          <CardDescription>
            Configura el precio, stock e imágenes de tu producto
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <FormLabel htmlFor="use-variants">Usar variantes</FormLabel>
          <Switch
            id="use-variants"
            checked={hasVariants}
            onCheckedChange={onToggleVariants}
          />
        </div>
      </CardHeader>
      <CardContent className="bg-sidebar flex flex-col gap-y-4">
        {!hasVariants && (
          <>
            {/* Images Section */}
            <div className="w-full">
              <FormField
                control={form.control}
                name="images_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imágenes del producto</FormLabel>
                    <FormControl>
                      <ImageUploadDropzone
                        value={field.value || []}
                        onChange={field.onChange}
                        onValueChange={(urls, options) => {
                          // Use setValue with proper options to control dirty state
                          form.setValue("images_url", urls, {
                            shouldDirty: options?.shouldDirty ?? true,
                            shouldValidate: options?.shouldValidate ?? true,
                          });
                        }}
                        maxFiles={20}
                        productId={productId || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Product Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="single_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <AmountInput
                        className="bg-background"
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
                name="single_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disponible</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-background"
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="single_sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="SKU"
                        className="bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Hidden field for fixed commission rate */}
              <FormField
                control={form.control}
                name="single_commission"
                render={({ field }) => (
                  <input type="hidden" {...field} value={commission} />
                )}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
