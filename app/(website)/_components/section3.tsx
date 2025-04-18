import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  KeyRound,
  Mail,
  Phone,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export const Section3 = ({ user }: { user: User | null }) => {
  return (
    <section className="w-full items-start lg:items-center justify-start lg:justify-center flex flex-col px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-20 pb-0 md:py-28 md:pb-0 lg:py-32 relative bg-sidebar border-t h-[calc(100dvh_-_56px)]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-10 lg:gap-14">
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3 shrink-0">
          <BlurFade direction="right" inView delay={0}>
            <h2
              className={cn(
                "text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight",
                libre.className
              )}
            >
              Regístrate fácilmente en Knoott Partners
            </h2>
          </BlurFade>
          <BlurFade direction="right" inView delay={0.1}>
            <p className="text-sm lg:text-base text-muted-foreground">
              Crear una cuenta en nuestra plataforma es rápido, gratuito y sin
              complicaciones. En minutos puedes comenzar a mostrar tus productos
              a miles de personas que están por celebrar el día más importante
              de sus vidas.
            </p>
          </BlurFade>
        </div>
        <div className="w-full h-fit items-start justify-start flex flex-col overflow-hidden lg:overflow-visible">
          <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
            <div className="w-full bg-background border shadow-lg p-3 lg:p-5 flex flex-col items-center justify-center gap-y-4 max-w-lg mx-auto">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="w-full flex flex-col gap-y-2">
                  <p className="text-sm font-semibold">Nombre(s)</p>
                  <Input readOnly placeholder="Juan" className="bg-sidebar pointer-events-none" />
                </div>
                <div className="w-full flex flex-col gap-y-2">
                  <p className="text-sm font-semibold">Apellido(s)</p>
                  <Input readOnly placeholder="Pérez" className="bg-sidebar pointer-events-none" />
                </div>
              </div>
              <div className="w-full flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Correo electrónico</p>
                <Input
                  readOnly
                  placeholder="email@email.com"
                  className="bg-sidebar pointer-events-none"
                />
              </div>
              <div className="w-full flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Número de teléfono</p>
                <div className="w-full flex items-center pointer-events-none">
                  <div className="h-9 px-2 shrink-0 flex gap-x-2 items-center border border-r-0 bg-sidebar">
                    <span className="flex items-center gap-x-1 text-sm">
                      🇲🇽 +52
                    </span>{" "}
                    <ChevronDown className="size-4" />
                  </div>
                  <Input
                    readOnly
                    placeholder="8717544123"
                    className="bg-sidebar"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ingresa tu número sin código de país, selecciónalo del menú
                  desplegable.
                </p>
              </div>
              <div className="w-full flex flex-col gap-y-2">
                <p className="text-sm font-semibold">Contraseña</p>
                <div className="relative flex items-center w-full pointer-events-none">
                  <Input
                    readOnly
                    placeholder="••••••••"
                    className="bg-sidebar"
                  />
                  <Eye className="absolute right-3 size-4 text-muted-foreground" />
                </div>
              </div>
              <Separator />
              <Button
                variant={"defaultBlack"}
                size={"default"}
                className="w-full pointer-events-none"
              >
                Crear cuenta <ArrowRight />
              </Button>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
};
