import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import { ArrowRight, ImagePlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Section4 = ({ user }: { user: User | null }) => {
  return (
    <section className="w-full items-start lg:items-center justify-start lg:justify-center flex flex-col px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-20 pb-0 md:py-28 md:pb-0 lg:py-32 relative bg-sidebar h-[calc(100dvh_-_56px)]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-10 lg:gap-14">
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3 shrink-0">
          <BlurFade direction="right" inView delay={0}>
            <h2
              className={cn(
                "text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight",
                libre.className
              )}
            >
              Completa el perfil de tu negocio
            </h2>
          </BlurFade>
          <BlurFade direction="right" inView delay={0.1}>
            <p className="text-sm lg:text-base text-muted-foreground">
              Cuéntanos más sobre tu empresa: qué vendes, cómo operas y qué te
              hace único. Esta información ayudará a conectar tus productos con
              las parejas ideales dentro de Knoott. Cuanto más completo tu
              perfil, más oportunidades tendrás de destacar.
            </p>
          </BlurFade>
        </div>
        <div className="w-full h-fit items-start justify-start flex flex-col overflow-hidden">
          <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
            <div className="w-full bg-background border shadow-md p-3 lg:p-5 flex flex-col items-start justify-start gap-y-4 max-w-lg mx-auto">
              <span className="w-full flex flex-col items-start justify-start">
                <p className="text-base font-semibold">
                  Información de tu negocio
                </p>
                <p className="text-xs text-muted-foreground">
                  Ingresa la información general de tu negocio
                </p>
              </span>
              <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                <p className="text-sm font-semibold">Logotipo</p>
                <div className="flex items-end justify-end gap-4">
                  <div className="bg-sidebar aspect-square w-24 border items-center justify-center flex shrink-0">
                    <ImagePlusIcon className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-balance">
                    La imágen debe ser cuadrada, de 500px x 500px, no debe
                    exceder los 5MB.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                <p className="text-sm font-semibold">Nombre de tu negocio</p>
                <Input
                  readOnly
                  placeholder="Nombre de tu negocio"
                  className="bg-sidebar pointer-events-none"
                />
              </div>
              <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                <p className="text-sm font-semibold">Sector o giro</p>
                <Select>
                  <SelectTrigger className="bg-sidebar pointer-events-none">
                    <SelectValue placeholder="Selecciona un sector" />
                  </SelectTrigger>
                </Select>
              </div>
              <span className="w-full flex flex-col items-start justify-start mt-2">
                <p className="text-base font-semibold">Información bancaria</p>
                <p className="text-xs text-muted-foreground">
                  Aquí enviaremos los pagos de tus órdenes.
                </p>
              </span>
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                  <p className="text-sm font-semibold">Cuenta CLABE</p>
                  <Input
                    readOnly
                    placeholder="123456789123456789"
                    className="bg-sidebar pointer-events-none"
                  />
                </div>
                <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                  <p className="text-sm font-semibold">Banco</p>
                  <Select>
                    <SelectTrigger className="bg-sidebar pointer-events-none">
                      <SelectValue placeholder="Selecciona un banco" />
                    </SelectTrigger>
                  </Select>
                </div>
              </div>
              <Separator className="w-full" />
              <Button className="w-full" variant={"defaultBlack"}>
                Enviar a revisión <ArrowRight />
              </Button>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
};
