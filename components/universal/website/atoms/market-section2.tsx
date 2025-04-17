"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

// Memoized Avatar component to prevent unnecessary re-renders
const MemoizedAvatar = React.memo(
  ({
    avatarUrl,
    index,
    prefix,
  }: {
    avatarUrl: string;
    index: number;
    prefix: string;
  }) => {
    // Generate consistent initials for each avatar
    const initials = useMemo(() => {
      // Use the avatar URL as a seed for consistent initials
      const hash = avatarUrl.split("seed=")[1]?.substring(0, 5) || "";
      const charCode1 =
        (hash.charCodeAt(0) % 26) + 65 || 65 + Math.floor(Math.random() * 26);
      const charCode2 =
        (hash.charCodeAt(1) % 26) + 65 || 65 + Math.floor(Math.random() * 26);
      return `${String.fromCharCode(charCode1)}${String.fromCharCode(
        charCode2
      )}`;
    }, [avatarUrl]);

    return (
      <Avatar
        key={`${prefix}-${index}`}
        className="rounded-full bg-background border hover:scale-105 ease-in-out duration-300 size-[52px]"
      >
        <AvatarImage src={avatarUrl || "/placeholder.svg"} />
        <AvatarFallback className="bg-background">{initials}</AvatarFallback>
      </Avatar>
    );
  }
);

MemoizedAvatar.displayName = "MemoizedAvatar";

export const MarketSection2 = () => {
  // Use a ref to track if we've already generated avatars
  const [isInitialized, setIsInitialized] = useState(false);

  // State to store avatar URLs for each marquee
  const [avatarData, setAvatarData] = useState<{
    marquee1: string[];
    marquee2: string[];
    marquee3: string[];
  }>({
    marquee1: [],
    marquee2: [],
    marquee3: [],
  });

  // Generate random seeds for avatars - only once
  const generateRandomSeed = () => Math.random().toString(36).substring(2, 10);

  // Generate avatars on component mount - only once
  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return;

    // Generate avatars for each marquee
    const generateAvatars = (count: number) => {
      return Array.from(
        { length: count },
        () =>
          `https://api.dicebear.com/9.x/notionists/svg?seed=${generateRandomSeed()}`
      );
    };

    // Set all avatar data at once to minimize state updates
    setAvatarData({
      marquee1: generateAvatars(20),
      marquee2: generateAvatars(20),
      marquee3: generateAvatars(20),
    });

    // Mark as initialized to prevent regeneration
    setIsInitialized(true);
  }, [isInitialized]);

  // Destructure the avatar data for easier access
  const { marquee1, marquee2, marquee3 } = avatarData;

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-sidebar group group-hover:bg-primary/5">
      {/* Marquees container */}
      <div className="w-full h-full absolute items-center justify-start pt-[8%] flex flex-col">
        {/* First marquee - left to right */}
        <div className="w-full overflow-hidden py-5">
          <div className="flex items-center justify-start gap-4 transition-transform duration-300 group-hover:animate-marquee">
            {marquee1.map((avatarUrl, index) => (
              <MemoizedAvatar
                key={`marquee1-${index}`}
                avatarUrl={avatarUrl}
                index={index}
                prefix="marquee1"
              />
            ))}
            {/* Duplicate for seamless loop */}
            {marquee1.map((avatarUrl, index) => (
              <MemoizedAvatar
                key={`marquee1-dup-${index}`}
                avatarUrl={avatarUrl}
                index={index}
                prefix="marquee1-dup"
              />
            ))}
          </div>
        </div>

        {/* Second marquee - right to left */}
        <div className="w-full overflow-hidden py-5">
          <div className="flex items-center gap-4 transition-transform duration-300 translate-x-[calc(-50%-1rem)] group-hover:animate-marquee-reverse">
            {marquee2.map((avatarUrl, index) => (
              <MemoizedAvatar
                key={`marquee2-${index}`}
                avatarUrl={avatarUrl}
                index={index}
                prefix="marquee2"
              />
            ))}
            {/* Duplicate for seamless loop */}
            {marquee2.map((avatarUrl, index) => (
              <MemoizedAvatar
                key={`marquee2-dup-${index}`}
                avatarUrl={avatarUrl}
                index={index}
                prefix="marquee2-dup"
              />
            ))}
          </div>
        </div>

        {/* Third marquee - left to right (slower) */}
        <div className="w-full overflow-hidden py-5">
          <div className="flex items-center gap-4 transition-transform duration-300 group-hover:animate-marquee-slow">
            {marquee3.map((avatarUrl, index) => (
              <MemoizedAvatar
                key={`marquee3-${index}`}
                avatarUrl={avatarUrl}
                index={index}
                prefix="marquee3"
              />
            ))}
            {/* Duplicate for seamless loop */}
            {marquee3.map((avatarUrl, index) => (
              <MemoizedAvatar
                key={`marquee3-dup-${index}`}
                avatarUrl={avatarUrl}
                index={index}
                prefix="marquee3-dup"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex w-full relative max-w-[60%] h-auto aspect-[3/4] translate-y-[15%] items-center justify-center bg-background border shadow-md group-hover:shadow-lg ease-in-out duration-300 z-10">
        <Image
          src="/refri-test.jpeg"
          fill
          className="object-contain"
          alt="Refrigerador"
        />
      </div>
    </div>
  );
};
