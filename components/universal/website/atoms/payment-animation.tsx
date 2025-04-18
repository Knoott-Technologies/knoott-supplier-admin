"use client";

import type React from "react";
import { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Icon } from "@/components/universal/logo";
import { Shopify } from "@/components/svgs/icons";
import { Box, Check, RefreshCcw, User2 } from "lucide-react";
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
        <div className="flex flex-col justify-center gap-4">
          <IconWrapper
            className="px-2 py-1 bg-sidebar gap-x-1 items-center flex text-sm text-muted-foreground rounded-[5px]"
            ref={div1Ref}
          >
            <Box className="size-4" />
            Orden
          </IconWrapper>
          <IconWrapper
            className="px-2 py-1 bg-sidebar gap-x-1 items-center flex text-sm text-muted-foreground rounded-[5px]"
            ref={div2Ref}
          >
            <Box className="size-4" />
            Orden
          </IconWrapper>
          <IconWrapper
            className="px-2 py-1 bg-sidebar gap-x-1 items-center flex text-sm text-muted-foreground rounded-[5px]"
            ref={div3Ref}
          >
            <Box className="size-4" />
            Orden
          </IconWrapper>
          <IconWrapper
            className="px-2 py-1 bg-sidebar gap-x-1 items-center flex text-sm text-muted-foreground rounded-[5px]"
            ref={div4Ref}
          >
            <Box className="size-4" />
            Orden
          </IconWrapper>
          <IconWrapper
            className="px-2 py-1 bg-sidebar gap-x-1 items-center flex text-sm text-muted-foreground rounded-[5px]"
            ref={div5Ref}
          >
            <Box className="size-4" />
            Orden
          </IconWrapper>
        </div>
        <div className="flex flex-col justify-center">
          <IconWrapper
            ref={div6Ref}
            className="size-16 lg:size-20 bg-foreground p-2 lg:p-4"
          >
            <Icon variant={"white"} className="size-full" />
          </IconWrapper>
        </div>
        <div className="flex flex-col justify-center">
          <IconWrapper
            ref={div7Ref}
            className="size-20 lg:size-32 relative overflow-hidden"
          >
            <Image src="/logo-test.png" alt="credit cards" fill />
          </IconWrapper>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div6Ref}
        gradientStartColor="#FFBD16"
        gradientStopColor="#A88631"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div6Ref}
        gradientStartColor="#FFBD16"
        gradientStopColor="#A88631"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div6Ref}
        gradientStartColor="#FFBD16"
        gradientStopColor="#A88631"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div4Ref}
        toRef={div6Ref}
        gradientStartColor="#FFBD16"
        gradientStopColor="#A88631"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div6Ref}
        gradientStartColor="#FFBD16"
        gradientStopColor="#A88631"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        gradientStartColor="#FFBD16"
        gradientStopColor="#A88631"
        startYOffset={-10}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div7Ref}
        gradientStartColor="#577F57"
        gradientStopColor="#2B652A"
        startYOffset={10}
        endYOffset={10}
      />
    </div>
  );
}
