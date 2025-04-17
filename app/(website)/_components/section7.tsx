import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";

export const Section7 = ({ user }: { user: User | null }) => {
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
        <div className="w-full h-fit items-start justify-start flex flex-col">
          <div className="w-full h-auto aspect-video bg-yellow-50"></div>
        </div>
      </div>
    </section>
  );
};
