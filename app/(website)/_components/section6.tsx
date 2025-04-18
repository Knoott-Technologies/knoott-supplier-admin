import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import Image from "next/image";
import NumberFlow from "@number-flow/react";
import { Button } from "@/components/ui/button";

const sampleGifts = [
  {
    name: "Pantalla 85 pulgadas",
    price: 2699900,
    image: "tele-test.jpeg",
    brand: "HAIER",
  },
  {
    name: "Refrigerador French Door",
    price: 2459900,
    image: "refri-test.jpeg",
    brand: "Samsung",
  },
  {
    name: "Horno Eléctrico de 90 cm",
    price: 3973100,
    image: "horno-test.jpg",
    brand: "SMEG",
  },
];

export const Section6 = ({ user }: { user: User | null }) => {
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
              Comienza a subir tu catálogo
            </h2>
          </BlurFade>
          <BlurFade direction="right" inView delay={0.1}>
            <p className="text-sm lg:text-base text-muted-foreground">
              Es momento de dar visibilidad a tus productos. Sube tu catálogo y
              empieza a formar parte del ecosistema Knoott, donde miles de
              personas verán tus artículos y podrán agregarlos directamente a
              sus mesas de regalos. Entre más completo tu catálogo, más
              oportunidades tendrás de vender.
            </p>
          </BlurFade>
        </div>
        <div className="w-full h-fit items-start justify-start flex flex-col overflow-hidden lg:overflow-visible">
          <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
            <div className="w-full bg-background border shadow-lg p-3 lg:p-5 flex flex-col items-start justify-start gap-y-4 max-w-[90%] mx-auto relative overflow-hidden">
              <div className="w-full flex gap-x-2 items-stretch justify-start">
                {sampleGifts.map((gift) => (
                  <div
                    key={gift.name}
                    className="w-full flex-1 items-start flex flex-col gap-y-2 min-w-[150px] lg:min-w-[250px]"
                  >
                    <div className="w-full aspect-[3/4] relative">
                      <Image
                        src={gift.image}
                        alt={gift.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="w-full flex flex-col items-start justify-start gap-y-3 flex-1">
                      <div className="w-full flex flex-col gap-y-1">
                        <p
                          className={cn(
                            "text-sm text-muted-foreground",
                            libre.className
                          )}
                        >
                          {gift.brand}
                        </p>
                        <p className="text-foreground font-medium text-sm">
                          {gift.name}
                        </p>
                      </div>
                      <div className="w-full flex flex-col gap-y-3 mt-auto">
                        <NumberFlow
                          className="text-foreground font-semibold text-base"
                          value={gift.price / 100}
                          format={{
                            currency: "MXN",
                            style: "currency",
                            currencyDisplay: "narrowSymbol",
                          }}
                          prefix="MXN "
                        />
                        <Button
                          variant={"defaultBlack"}
                          size={"sm"}
                          className="text-sm px-3 w-full py-1.5 h-fit pointer-events-none"
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
};
