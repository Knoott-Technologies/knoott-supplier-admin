"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GroupedVariant } from "../page";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Images } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const ProductVariantInfo = ({
  variants,
  businessId,
}: {
  variants: GroupedVariant[];
  businessId: string;
}) => {
  return (
    <Card className="w-full flex flex-col h-fit">
      <CardHeader>
        <CardTitle>Variantes del producto</CardTitle>
        <CardDescription>
          Aquí podrás ver la información de las variantes
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-sidebar w-full flex flex-col gap-y-4">
        {variants.map((variant) => (
          <Card key={variant.variant.id} className="w-full flex flex-col">
            <CardHeader className="bg-sidebar space-y-0">
              <span className="gap-y-0">
                <p className="text-base font-semibold">
                  {variant.variant.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Información de la variante
                </p>
              </span>
            </CardHeader>
            <CardContent className="w-full h-fit flex flex-col bg-background gap-y-2">
              {variant.options.map((option) => (
                <div
                  key={option.id}
                  className="w-full flex flex-col items-start justify-start gap-y-2 p-3 border bg-sidebar"
                >
                  <div className="w-full h-fit items-stretch justify-start flex gap-4">
                    {(option.images_url && option.images_url.length > 0 && (
                      <div className="max-w-[120px] w-full shrink-0 flex flex-col items-start justify-start gap-y-2">
                        <div className="w-full aspect-[3/4] relative overflow-hidden">
                          <Image
                            src={option.images_url[0]}
                            alt={option.display_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {option.images_url.length > 1 && (
                          <Button
                            variant={"outline"}
                            size={"sm"}
                            className="w-full bg-sidebar"
                          >
                            Ver {option.images_url.length}
                            <ArrowRight className="!size-3.5" />
                          </Button>
                        )}
                      </div>
                    )) || (
                      <div className="max-w-[120px] w-full shrink-0 flex flex-col items-start justify-start gap-y-2">
                        <div className="w-full aspect-[3/4] relative text-muted-foreground/50 overflow-hidden bg-background flex text-center text-sm items-center justify-center border p-3">
                          <Images className="size-4" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 items-start justify-between flex flex-col gap-2 py-2">
                      <span className="w-full h-fit items-start justify-between flex">
                        <span className="flex flex-col gap-y-1">
                          <p className="text-base font-semibold">
                            {option.display_name} ({option.name})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {option.sku || "Sin SKU"}
                          </p>
                        </span>
                      </span>
                      <span className="w-full h-fit items-start justify-between flex">
                        <p className="text-base font-semibold">
                          MXN {formatPrice(option.price || 0)}
                        </p>
                        <p className="text-sm font-semibold">
                          <span className="text-muted-foreground">Stock:</span>{" "}
                          {option.stock}
                        </p>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

{
  /* <span className="w-full flex flex-col gap-y-1">
                          <p className="text-sm font-semibold">Nombre:</p>
                          <p
                            title={option.name}
                            className="text-sm line-clamp-6 font-medium text-muted-foreground"
                          >
                            {option.name}
                          </p>
                        </span>
                        <span className="w-full flex flex-col gap-y-1">
                          <p className="text-sm font-semibold">SKU:</p>
                          <p
                            title={option.sku || "Sin SKU"}
                            className="text-sm line-clamp-6 font-medium text-muted-foreground"
                          >
                            {option.sku}
                          </p>
                        </span>
                        <span className="w-full flex flex-col gap-y-1">
                          <p className="text-sm font-semibold">Stock:</p>
                          <p
                            title={option.stock?.toString() || "Sin Stock"}
                            className="text-sm line-clamp-6 font-medium text-muted-foreground"
                          >
                            {option.stock?.toString() || "Sin Stock"}
                          </p>
                        </span>
                        <span className="w-full flex flex-col gap-y-1">
                          <p className="text-sm font-semibold">
                            Precio de lista:
                          </p>
                          <p
                            title={option.price?.toString()}
                            className="text-sm line-clamp-6 font-medium text-muted-foreground"
                          >
                            MXN {formatPrice(option.price || 0)}
                          </p>
                        </span> */
}
