"use client";

import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/magicui/blur-fade";
import type { User } from "@supabase/supabase-js";
import { libre } from "@/components/fonts/font-def";
import NumberFlow from "@number-flow/react";
import { useState, useEffect, useRef } from "react";

export const Section9 = ({ user }: { user: User | null }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [finish, setFinish] = useState(false);
  const [numberValue, setNumberValue] = useState(0.12); // Start at 12%
  const sectionRef = useRef<HTMLElement>(null);

  // Set up Intersection Observer to detect when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        root: null, // viewport
        rootMargin: "0px",
        threshold: 0.3, // 30% of the section needs to be visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  // Change value after 1 second when component becomes visible
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isVisible) {
      timeout = setTimeout(() => {
        setNumberValue(0.058); // Change to 5.8%
      }, 1000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="visibility"
      className="w-full h-fit items-center justify-center grid grid-cols-1 lg:grid-cols-2 px-5 md:px-7 lg:px-14 xl:px-36 gap-10 lg:gap-14 2xl:px-56 py-20 md:py-28 lg:py-32 relative bg-sidebar border-t lg:min-h-[60vh]"
    >
      <div className="w-full h-fit items-start justify-start flex flex-col gap-y-3 max-w-2xl">
        <BlurFade direction="right" inView delay={0}>
          <h2
            className={cn(
              "text-3xl lg:text-4xl xl:text-5xl font-semibold tracking-tight",
              libre.className
            )}
          >
            La comisión más baja del mercado
          </h2>
        </BlurFade>
        <BlurFade direction="right" inView delay={0.1}>
          <p className="text-sm lg:text-base text-muted-foreground">
            En Knoott Partners no cobramos por registrarte ni por subir tu
            catálogo. Solo ganamos cuando tú ganas. Por cada orden procesada,
            aplicamos una comisión del{" "}
            <span className="text-foreground font-medium">5.8%</span>, una de
            las más bajas del mercado.{" "}
            <span className="text-foreground font-medium">
              Sin cuotas ocultas, sin costos mensuales: solo crecimiento
              compartido.
            </span>
          </p>
        </BlurFade>
      </div>
      <div className="w-full h-fit items-start justify-start flex flex-col px-3 lg:px-0">
        <BlurFade inView delay={0.2} direction="up" className="w-full h-fit">
          <div className="h-fit items-center justify-center mx-auto max-w-lg w-fit px-5 lg:px-10 ease-in-out transition-all duration-300 flex bg-background border shadow-md rotate-[6deg] lg:rotate-[10deg]">
            <NumberFlow
              value={numberValue}
              format={{
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }}
              onAnimationsStart={(e) => setFinish(true)}
              willChange
              className={cn(
                "text-[clamp(6rem,8vw,12rem)] font-bold tracking-tighter leading-[0] ease-in-out duration-700",
                finish && "text-success"
              )}
            />
          </div>
        </BlurFade>
      </div>
    </section>
  );
};
