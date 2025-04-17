import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";

export const Section4 = ({ user }: { user: User | null }) => {
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
        <div className="w-full h-fit items-start justify-start flex flex-col">
          <div className="w-full h-auto aspect-video bg-blue-50"></div>
        </div>
      </div>
    </section>
  );
};
