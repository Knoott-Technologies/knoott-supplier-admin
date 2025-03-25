import { libre } from "@/components/fonts/font-def";
import { Button } from "@/components/ui/button";
import { Video } from "@/components/universal/video-optimized";
import { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import { User } from "@supabase/supabase-js";
import { ArrowRight } from "lucide-react";

export const HeroSuppliers = ({
  user,
  userProvider,
}: {
  user: User | null;
  userProvider:
    | Database["public"]["Tables"]["user_provider_branches"]["Row"]
    | null;
}) => {
  return (
    <section className="w-full h-fit items-start justify-start flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 after:absolute after:inset-0 after:z-[1]">
        <Video
          src="/shipping-knoott.mp4"
          loop
          autoPlay
          muted
          objectFit="cover"
          controls={false}
          className="w-full h-full"
          poster="/poster-hero.jpg"
        />
        <div className="w-full absolute inset-0 bg-black/60" />
      </div>
      <div className="w-full h-fit flex px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-24 pt-36 md:py-28 md:pt-42 lg:py-36 lg:pt-52 relative z-10">
        <div className="w-full items-start justify-start flex flex-col gap-y-10 lg:gap-y-14 max-w-3xl">
          <span className="w-full h-fit items-start justify-start flex flex-col gap-y-3">
            <h1
              className={cn(
                "text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-background",
                libre.className
              )}
            >
              Conviértete en proveedor de Knoott y obtén beneficios exclusivos
            </h1>
            <p className="text-base lg:text-lg text-background opacity-80">
              En Knoott nos apasiona impulsar el crecimiento de nuestros socios.
              Por eso, ofrecemos un soporte personalizado, herramientas de
              vanguardia y oportunidades únicas para que tu negocio alcance
              nuevas metas. Únete a nuestra red de proveedores y descubre todo
              lo que podemos lograr juntos.
            </p>
          </span>
          {(user && !userProvider && (
            <div className="w-full h-fit items-start lg:items-center justify-start flex flex-col lg:flex-row gap-2">
              <Button
                variant={"defaultBlack"}
                size={"lg"}
                className="w-full md:w-auto"
              >
                Registra tu negocio
              </Button>
            </div>
          )) ||
            (userProvider && (
              <div className="w-full h-fit items-start lg:items-center justify-start flex flex-col lg:flex-row gap-2">
                <Button
                  variant={"defaultBlack"}
                  size={"lg"}
                  className="w-full md:w-auto"
                >
                  Entrar a mi dashboard <ArrowRight />
                </Button>
              </div>
            )) || (
              <div className="w-full h-fit items-start lg:items-center justify-start flex flex-col lg:flex-row gap-2">
                <Button
                  variant={"defaultBlack"}
                  size={"lg"}
                  className="w-full md:w-auto"
                >
                  Unirse a Knoott Suppliers
                </Button>
                <Button
                  variant={"ghost"}
                  size={"lg"}
                  className="w-full md:w-auto bg-transparent text-background"
                >
                  Ingresa a tu cuenta <ArrowRight />
                </Button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};
