"use client";

import type React from "react";
import { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Icon } from "@/components/universal/logo";
import { Shopify } from "@/components/svgs/icons";
import { Check, RefreshCcw, User2 } from "lucide-react";
import Image from "next/image";

const IconWrapper = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex items-center justify-center border bg-background shadow-md rounded-[10px]",
        className
      )}
    >
      {children}
    </div>
  );
});

IconWrapper.displayName = "Wrapper";

export function PaymentAnimation() {
  // Move all useRef calls to the top level, outside of any conditions
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex w-full items-center justify-center"
      ref={containerRef}
    >
      <div className="flex w-full flex-row items-stretch justify-between gap-10">
        <div className="flex flex-col justify-center gap-2">
          <IconWrapper className="p-2 lg:p-3" ref={div1Ref}>
            <User2 className="size-4 lg:size-6" />
          </IconWrapper>
          <IconWrapper className="p-2 lg:p-3" ref={div2Ref}>
            <User2 className="size-4 lg:size-6" />
          </IconWrapper>
          <IconWrapper className="p-2 lg:p-3" ref={div3Ref}>
            <User2 className="size-4 lg:size-6" />
          </IconWrapper>
          <IconWrapper className="p-2 lg:p-3" ref={div4Ref}>
            <User2 className="size-4 lg:size-6" />
          </IconWrapper>
          <IconWrapper className="p-2 lg:p-3" ref={div5Ref}>
            <User2 className="size-4 lg:size-6" />
          </IconWrapper>
        </div>
        <div className="flex flex-col justify-center">
          <IconWrapper
            ref={div6Ref}
            className="size-14 lg:size-20 bg-foreground p-2 lg:p-4"
          >
            <Icon variant={"white"} className="size-full" />
          </IconWrapper>
        </div>
        <div className="flex flex-col justify-center">
          <IconWrapper
            ref={div7Ref}
            className="size-16 lg:size-32 relative overflow-hidden"
          >
            <Image src="/logo-test.png" alt="credit cards" fill />
          </IconWrapper>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
      />
    </div>
  );
}
