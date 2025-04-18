import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import { PaymentAnimation } from "@/components/universal/website/atoms/payment-animation";

export const Section8 = ({ user }: { user: User | null }) => {
  return (
    <section className="w-full h-fit items-center justify-center grid grid-cols-1 lg:grid-cols-2  px-5 md:px-7 lg:px-14 xl:px-36 gap-10 lg:gap-14 2xl:px-56 py-20 md:py-28 lg:py-32 relative bg-background border-t">
      <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3 max-w-2xl">
        <BlurFade direction="right" inView delay={0}>
          <h2
            className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight",
              libre.className
            )}
          >
            Recibe tu pago de forma rápida y sin complicaciones
          </h2>
        </BlurFade>
        <BlurFade direction="right" inView delay={0.1}>
          <p className="text-sm lg:text-base text-muted-foreground">
            Cada vez que recibas una orden, te la enviaremos para su
            verificación. Una vez que confirmes que puedes completarla,
            procesaremos el pago de forma inmediata, directa y sin fricción. Así
            de fácil es vender con Knoott Partners.
          </p>
        </BlurFade>
      </div>
      <div className="w-full h-fit items-start justify-start flex flex-col">
        <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
          <div className="w-full h-fit items-center justify-center mx-auto max-w-lg">
            <PaymentAnimation />
          </div>
        </BlurFade>
      </div>
    </section>
  );
};
