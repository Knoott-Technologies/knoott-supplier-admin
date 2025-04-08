"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

export const ProductImageCarousel = ({ images }: { images: string[] }) => {
  return (
    <Card className="w-full h-fit lg:sticky lg:top-[calc(56px_+_28px)]">
      <CardHeader gap->
        <CardTitle>Imágenes del producto</CardTitle>
        <CardDescription>
          Echa un vistazo a las imágenes de este producto.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full bg-sidebar flex p-0">
        <Carousel className="w-full">
          <div className="w-full p-3">
            <div className="w-full h-fit border">
              <CarouselContent className="w-full ml-0">
                {images.map((image, index) => (
                  <CarouselItem key={index} className="pl-0">
                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                      <Image
                        src={image}
                        alt={`Image ${index}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
          </div>
          <div className="w-full p-3 bg-background border-t flex items-center justify-between">
            <CarouselPrevious
              variant={"defaultBlack"}
              className="static right-0 top-0 -translate-y-0"
            />
            <CarouselNext
              variant={"defaultBlack"}
              className="static left-0 top-0 -translate-y-0"
            />
          </div>
        </Carousel>
      </CardContent>
    </Card>
  );
};
