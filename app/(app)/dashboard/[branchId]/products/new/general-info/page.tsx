"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WizardProgress } from "../_components/wizard-progress";
import { GeneralInfoFormValues, generalInfoSchema } from "@/lib/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";

export default function GeneralInfoPage({
  params,
}: {
  params: { branchId: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GeneralInfoFormValues>({
    resolver: zodResolver(generalInfoSchema),
    defaultValues: {
      name: "",
      short_name: "",
      description: "",
      short_description: "",
    },
  });

  const onSubmit = async (data: GeneralInfoFormValues) => {
    setIsSubmitting(true);

    try {
      // Store the data in localStorage for now
      localStorage.setItem("product_general_info", JSON.stringify(data));

      // Navigate to the next step
      router.push(`/dashboard/${params.branchId}/products/new/images`);
    } catch (error) {
      console.error("Error saving general info:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <WizardProgress branchId={params.branchId} />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Ingresa la información general de tu producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-sidebar">
          <Form {...form}>
            <form
              id="product-general-info"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del producto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Camiseta de algodón premium"
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
                name="short_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre corto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Camiseta premium"
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción completa</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe detalladamente tu producto..."
                        className="min-h-32 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción corta</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Versión resumida de la descripción..."
                        className="min-h-32 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end w-full">
            <Button
              variant={"defaultBlack"}
              form="product-general-info"
              type="submit"
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
