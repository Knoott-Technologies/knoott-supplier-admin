import { libre } from "@/components/fonts/font-def";
import { Button } from "@/components/ui/button";
import { Video } from "@/components/universal/video-optimized";
import type { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type UserBusinessType =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

export const HeroSuppliers = ({
  user,
  userBusiness,
}: {
  user: User | null;
  userBusiness: UserBusinessType[] | null;
}) => {
  return (
    <section className="w-full h-fit items-center justify-center flex flex-col relative overflow-hidden min-h-[80vh]">
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
                "text-5xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold text-background text-balance",
                libre.className
              )}
            >
              Impulsa tu marca dentro de Knoott
            </h1>
            <p className="text-base lg:text-lg text-background opacity-80">
              En Knoott creemos en el potencial de cada partner. Te conectamos
              con nuevas audiencias, te damos herramientas inteligentes para
              administrar tus productos y te acompañamos con soporte
              personalizado en cada paso. Únete hoy a la comunidad de Knoott
              Partners y transforma tu negocio con nosotros.
            </p>
          </span>
          {(user && !userBusiness && (
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
            (userBusiness && (
              <div className="w-full h-fit items-start lg:items-center justify-start flex flex-col lg:flex-row gap-2">
                <Button
                  variant={"outline"}
                  size={"default"}
                  className="w-full md:w-auto"
                  asChild
                >
                  <Link href={`/dashboard/`}>
                    Entrar a mi dashboard
                    <span className="flex -space-x-[0.45rem]">
                      {userBusiness.map((business) => (
                        <span
                          key={business.id}
                          className="ring-background rounded-full ring-1 overflow-hidden"
                        >
                          <Image
                            src={business.business.business_logo_url}
                            width={16}
                            height={16}
                            alt="Avatar 01"
                          />
                        </span>
                      ))}
                    </span>
                  </Link>
                </Button>
                <Button
                  variant={"ghost"}
                  size={"default"}
                  className="w-full md:w-auto bg-transparent text-background"
                  asChild
                >
                  <Link href="/docs">
                    Ver documentación <ArrowRight />
                  </Link>
                </Button>
              </div>
            )) || (
              <div className="w-full h-fit items-start lg:items-center justify-start flex flex-col lg:flex-row gap-2">
                <Button
                  variant={"ghost"}
                  size={"default"}
                  className="w-full md:w-auto bg-transparent text-background"
                  asChild
                >
                  <Link href="/login">Ingresa a tu cuenta</Link>
                </Button>
                <Button
                  variant={"defaultBlack"}
                  size={"default"}
                  className="w-full md:w-auto"
                >
                  Comienza ahora <ArrowRight />
                </Button>
              </div>
            )}
        </div>
      </div>
    </section>
  );
};
