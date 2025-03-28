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
import { ArrowRight } from "lucide-react";

export const ProductVariantInfor = ({
  variants,
}: {
  variants: GroupedVariant[];
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
            <CardHeader className="bg-sidebar">
              <span className="gap-y-0">
                <p className="text-base font-semibold">
                  {variant.variant.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Información de la variante
                </p>
              </span>
            </CardHeader>
            <CardContent className="w-full h-fit flex flex-col bg-background">
              {variant.options.map((option) => (
                <div
                  key={option.id}
                  className="w-full flex flex-col items-start justify-start gap-y-2"
                >
                  <div className="w-full h-fit items-stretch justify-start flex gap-4">
                    <div className="flex-1 items-start justify-start flex flex-col gap-2">
                      <span className="w-full h-fit items-start justify-start grid grid-cols-1 md:grid-cols-2 gap-4">
                        <span className="w-full flex flex-col gap-y-1">
                          <p className="text-sm font-semibold">Nombre:</p>
                          <p
                            title={option.name}
                            className="text-sm line-clamp-6 font-medium text-muted-foreground"
                          >
                            {option.name}
                          </p>
                        </span>
                      </span>
                    </div>
                    {option.images_url && option.images_url.length > 0 && (
                      <div className="max-w-[140px] w-full shrink-0 flex flex-col items-start justify-start gap-y-2">
                        <p className="text-sm font-semibold">
                          {option.images_url.length === 1
                            ? "Imagen:"
                            : "Imágenes:"}
                        </p>
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
                    )}
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
