import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";

export const Section5 = ({ user }: { user: User | null }) => {
  return (
    <section className="w-full items-center justify-center flex flex-col px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-20 md:py-28 lg:py-32 relative bg-sidebar h-[calc(100dvh_-_56px)]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-center gap-10 lg:gap-14">
        <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3">
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
        <div className="w-full h-fit items-start justify-start flex flex-col">
          <div className="w-full h-auto aspect-video bg-green-50"></div>
        </div>
      </div>
    </section>
  );
};
