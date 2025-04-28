"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AmountInput } from "@/components/universal/amount-input";
import type { UseFormReturn } from "react-hook-form";

interface ShippingSectionProps {
  form: UseFormReturn<any>;
}

export default function ShippingSection({ form }: ShippingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Envío</CardTitle>
        <CardDescription>
          Configura los costos de envío para este producto
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar">
        <FormField
          control={form.control}
          name="shipping_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo de envío</FormLabel>
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
      </CardContent>
    </Card>
  );
}
