"use client";

import React, { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { Icon } from "@/components/universal/logo";
import { Shopify } from "@/components/svgs/icons";
import { Check, CheckCheck, RefreshCcw } from "lucide-react";

const IconWrapper = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex p-2 lg:p-5 items-center justify-center border bg-background shadow-md rounded-[10px]",
        className
      )}
    >
      {children}
    </div>
  );
});

IconWrapper.displayName = "Wrapper";

export function IntegrationAnimation({
  isSyncronized,
}: {
  isSyncronized: boolean;
}) {
  if (isSyncronized) {
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);
    const div3Ref = useRef<HTMLDivElement>(null);

    return (
      <div
        className="relative flex w-full items-center justify-center overflow-hidden p-5 lg:p-14 bg-success/10"
        ref={containerRef}
      >
        <div className="flex size-full flex-col items-stretch justify-between gap-10 max-w-sm lg:max-w-md">
          <div className="flex flex-row justify-between">
            <IconWrapper ref={div1Ref}>
              <Icon className="size-14 lg:size-16" />
            </IconWrapper>
            <div className="flex items-center justify-center">
              <IconWrapper
                className="bg-success size-fit shrink-0 p-3 lg:p-3 rounded-[10px]"
                ref={div2Ref}
              >
                <Check className="size-4 lg:size-6 text-background" />
              </IconWrapper>
            </div>
            <IconWrapper ref={div3Ref}>
              <Shopify className="size-14 lg:size-16" />
            </IconWrapper>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div2Ref}
          startYOffset={10}
          endYOffset={10}
          curvature={-0}
          gradientStartColor="#FFBD16"
          gradientStopColor="#CCAC5D"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div1Ref}
          toRef={div2Ref}
          startYOffset={-10}
          endYOffset={-10}
          curvature={0}
          gradientStartColor="#95BF45"
          gradientStopColor="#5E8E3D"
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div2Ref}
          startYOffset={-10}
          endYOffset={-10}
          curvature={0}
          gradientStartColor="#95BF45"
          gradientStopColor="#5E8E3D"
          reverse
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={div3Ref}
          toRef={div2Ref}
          startYOffset={10}
          endYOffset={10}
          curvature={-0}
          gradientStartColor="#FFBD16"
          gradientStopColor="#CCAC5D"
        />
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex w-full items-center justify-center overflow-hidden p-5 lg:p-14"
      ref={containerRef}
    >
      <div className="flex size-full flex-col items-stretch justify-between gap-10 max-w-sm lg:max-w-md">
        <div className="flex flex-row justify-between">
          <IconWrapper ref={div1Ref}>
            <Icon className="size-14 lg:size-16" />
          </IconWrapper>
          <div className="flex items-center justify-center">
            <IconWrapper
              className="bg-background size-fit shrink-0 p-3 lg:p-3 rounded-[10px]"
              ref={div2Ref}
            >
              <RefreshCcw className="size-4 lg:size-6 text-muted-foreground" />
            </IconWrapper>
          </div>
          <IconWrapper ref={div3Ref}>
            <Shopify className="size-14 lg:size-16" />
          </IconWrapper>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={10}
        endYOffset={10}
        curvature={-0}
        gradientStartColor="#FFBD16"
        gradientStopColor="#CCAC5D"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        startYOffset={-10}
        endYOffset={-10}
        curvature={0}
        gradientStartColor="#95BF45"
        gradientStopColor="#5E8E3D"
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div2Ref}
        startYOffset={-10}
        endYOffset={-10}
        curvature={0}
        gradientStartColor="#95BF45"
        gradientStopColor="#5E8E3D"
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div2Ref}
        startYOffset={10}
        endYOffset={10}
        curvature={-0}
        gradientStartColor="#FFBD16"
        gradientStopColor="#CCAC5D"
      />
    </div>
  );
}
