import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import { Icon } from "@/components/universal/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const Section7 = ({ user }: { user: User | null }) => {
  return (
    <section className="w-full items-start lg:items-center justify-start lg:justify-center flex flex-col px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-20 pb-0 md:py-28 md:pb-0 lg:py-32 relative bg-sidebar h-[calc(100vh_-_56px)]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-10 lg:gap-14">
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3 shrink-0">
          <BlurFade direction="right" inView delay={0}>
            <h2
              className={cn(
                "text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight",
                libre.className
              )}
            >
              ¡Empieza a vender en Knoott!
            </h2>
          </BlurFade>
          <BlurFade direction="right" inView delay={0.1}>
            <p className="text-sm lg:text-base text-muted-foreground">
              Ya estás listo para recibir órdenes directamente desde las mesas
              de regalos de cientos de parejas. Cada producto que publiques
              estará disponible para quienes celebran el día más importante de
              su vida. ¡Conecta, vende y haz que tus productos formen parte de
              momentos inolvidables!
            </p>
          </BlurFade>
        </div>
        <div className="w-full h-fit items-start justify-start flex flex-col overflow-hidden lg:overflow-visible">
          <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
            <div className="bg-background border shadow-lg p-7 lg:p-14 flex flex-col items-center justify-center gap-y-5 lg:gap-y-7 max-w-[90%] mx-auto relative overflow-hidden">
              <div className="size-fit relative">
                <div className="aspect-square w-28 border bg-muted items-center justify-center flex shrink-0 relative overflow-hidden">
                  <Store className="text-muted-foreground size-14" strokeWidth={1.5} />
                </div>
                <Badge
                  variant={"outline"}
                  className="absolute pointer-events-none -top-2 -right-1/4 z-10 font-normal bg-sidebar shadow-md text-muted-foreground"
                >
                  Tu tienda
                </Badge>
              </div>
              <span className="flex flex-col items-center justify-center gap-y-2 w-full">
                <p
                  className={cn(
                    "text-lg md:text-xl lg:text-2xl text-foreground text-center text-pretty font-semibold leading-tight tracking-tight",
                    libre.className
                  )}
                >
                  ¡Buenas noticias! Has recibido una orden en tu tienda.
                </p>
                <p className="text-sm lg:text-base text-muted-foreground text-center">
                  Puedes ver los detalles en tu dashboard, recuerda que debes
                  verificar la orden para recibir el pago.
                </p>
              </span>
              <Button
                variant={"secondary"}
                size={"lg"}
                className="pointer-events-none"
              >
                Aceptar orden <ArrowRight />
              </Button>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
};
