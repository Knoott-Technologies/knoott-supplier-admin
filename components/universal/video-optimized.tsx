"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface VideoProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  poster?: string;
  objectFit?: "cover" | "contain";
}

export const Video = ({
  src,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
  poster,
  objectFit = "cover",
}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <video
        ref={videoRef}
        className={cn(
          "w-full h-full",
          objectFit === "cover" ? "object-cover" : "object-contain"
        )}
        preload="metadata"
        playsInline
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        poster={poster}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};
