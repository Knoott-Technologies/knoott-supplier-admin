import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Badge, Check } from "lucide-react";

export const Section5 = ({ user }: { user: User | null }) => {
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
              Verificaremos tu información
            </h2>
          </BlurFade>
          <BlurFade direction="right" inView delay={0.1}>
            <p className="text-sm lg:text-base text-muted-foreground">
              Una vez que completes tu perfil, nuestro equipo validará los datos
              de tu negocio para asegurarse de que todo esté en orden. Te
              enviaremos una notificación en cuanto tu cuenta esté lista para
              comenzar a vender en Knoott.
            </p>
          </BlurFade>
        </div>
        <div className="w-full h-fit items-start justify-start flex flex-col overflow-hidden lg:overflow-visible">
          <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
            <div className="w-full bg-background border shadow-lg p-3 lg:p-5 flex flex-col items-start justify-start gap-y-4 max-w-lg mx-auto relative">
              <div className="size-12 bg-success aspect-square items-center justify-center flex absolute top-3 right-3 lg:top-5 lg:right-5">
                <Check className="text-background size-8" />
              </div>
              <span className="w-full flex flex-col items-start justify-start">
                <p className="text-base font-semibold">
                  Información de tu negocio
                </p>
                <p className="text-xs text-muted-foreground">
                  Ingresa la información general de tu negocio
                </p>
              </span>
              <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                <p className="text-sm font-semibold text-success">Logotipo</p>
                <div className="flex items-end justify-end gap-4">
                  <div className="aspect-square w-24 border border-success bg-success/10 items-center justify-center flex shrink-0 relative overflow-hidden">
                    <Image src={"/logo-test.png"} alt="logo" fill />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                <p className="text-sm font-semibold text-success">
                  Nombre de tu negocio
                </p>
                <Input
                  readOnly
                  placeholder="Nombre de tu negocio"
                  value={"Tu negocio"}
                  className="bg-success/10 text-success border-success pointer-events-none"
                />
              </div>
              <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                <p className="text-sm font-semibold text-success">
                  Sector o giro
                </p>
                <Select value="muebles">
                  <SelectTrigger className="bg-success/10 text-success border-success pointer-events-none">
                    <SelectValue placeholder="Selecciona un sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muebles">Tienda de muebles</SelectItem>
                  </SelectContent>
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
                  <p className="text-sm font-semibold text-success">
                    Cuenta CLABE
                  </p>
                  <Input
                    readOnly
                    placeholder="123456789123456789"
                    value={"123456789123456789"}
                    className="bg-success/10 text-success border-success pointer-events-none"
                  />
                </div>
                <div className="flex flex-col gap-y-2 items-start justify-start w-full">
                  <p className="text-sm font-semibold text-success">Banco</p>
                  <Select value="BBVA">
                    <SelectTrigger className="pointer-events-none border-success bg-success/10 text-success">
                      <SelectValue placeholder="Selecciona un banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BBVA">BBVA</SelectItem>
                      <SelectItem value="Santander">Santander</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
};
