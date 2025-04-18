import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketSection2 } from "@/components/universal/website/atoms/market-section2";
import { CatalogSection2 } from "@/components/universal/website/atoms/catalog-section2";
import { OrdersSection2 } from "@/components/universal/website/atoms/orders-section2";

const cards = [
  {
    title: "Administra tu catálogo en nuestra plataforma",
    description:
      "Sube, edita y organiza todos tus productos en un solo lugar. Nuestra plataforma te permite mantener tu catálogo actualizado en todo momento.",
    href: "/product/catalog",
    comp: <CatalogSection2 />,
  },
  {
    title: "Acerca tus productos a un nuevo mercado",
    description:
      "Conecta con miles de parejas que buscan productos únicos para su boda. Da visibilidad a tu catálogo justo donde la intención de compra es más alta.",
    href: "/product/market",
    comp: <MarketSection2 />,
  },
  {
    title: "Gestiona tus órdenes con facilidad",
    description:
      "Recibe pedidos claros, con detalles de entrega y seguimiento. Knoott Partners te ayuda a mantener todo bajo control, sin complicaciones.",
    href: "/product/orders",
    comp: <OrdersSection2 />,
  },
];

export const Section2 = ({ user }: { user: User | null }) => {
  return (
    <section className="w-full h-fit items-start justify-start flex flex-col px-5 md:px-7 gap-y-10 lg:gap-y-14 lg:px-14 xl:px-36 2xl:px-56 py-20 md:py-28 lg:py-32 relative bg-background">
      <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3 max-w-2xl">
        <BlurFade direction="right" inView delay={0}>
          <h2
            className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight",
              libre.className
            )}
          >
            Desbloquea un nuevo canal de ventas para tu negocio
          </h2>
        </BlurFade>
        <BlurFade direction="right" inView delay={0.1}>
          <p className="text-sm lg:text-base text-muted-foreground">
            Vende directamente en las mesas de regalos de boda más modernas.
            Llegarás a nuevos clientes con intención de compra y sin fricción.
            Simple, directo y sin complicaciones.
          </p>
        </BlurFade>
      </div>
      <div className="w-full h-fit grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-2 lg:gap-5 xl:gap-7">
        {cards.map((card, index) => {
          return (
            <BlurFade
              direction="up"
              inView
              key={index}
              delay={0.2 + index * 0.1}
              className="w-full flex-1 hover:shadow-lg ease-in-out duration-300 group"
            >
              <Link href={card.href} className="w-full h-full">
                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base lg:text-lg">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 bg-background h-full">
                    <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                      {card.comp}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t text-sm text-muted-foreground group-hover:text-foreground ease-in-out duration-300">
                    Mas información <ArrowRight className="size-4" />
                  </CardFooter>
                </Card>
              </Link>
            </BlurFade>
          );
        })}
      </div>
    </section>
  );
};
