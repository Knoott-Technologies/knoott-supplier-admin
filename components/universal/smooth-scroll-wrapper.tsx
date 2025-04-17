"use client";

import { useState, useEffect, type ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FullpageScrollProps {
  children: ReactNode;
  className?: string;
  transitionDuration?: number;
}

export const FullpageScroll = ({
  children,
  className = "",
  transitionDuration = 0.5,
}: FullpageScrollProps) => {
  const childrenArray = Array.isArray(children) ? children : [children];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to determine active section
  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioning || !containerRef.current) return;

      const { top, height } = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // If container is not visible at all, do nothing
      if (top > viewportHeight || top + height < 0) return;

      // Calculate how far we've scrolled through the container
      const scrollProgress = (viewportHeight - top) / (viewportHeight + height);

      // Map scroll progress to section index
      const targetIndex = Math.min(
        Math.floor(scrollProgress * childrenArray.length),
        childrenArray.length - 1
      );

      if (targetIndex !== activeIndex && !isTransitioning) {
        setIsTransitioning(true);
        setActiveIndex(targetIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [activeIndex, childrenArray.length, isTransitioning]);

  // Reset transition state after animation completes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, transitionDuration]);

  return (
    <div
      ref={containerRef}
      className={`w-full relative h-fit ${className}`}
      // Set a minimum height to ensure the container is tall enough to scroll through
      style={{ minHeight: `${childrenArray.length * 100}vh` }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration }}
          className="w-full sticky top-[55px]"
        >
          {childrenArray[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
