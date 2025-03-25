"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const SidebarBox = ({ children }: { children: React.ReactNode }) => {
  const { state, isMobile } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 items-start justify-start flex flex-col w-full no-scrollbar",
        isMobile && "max-w-full",
        state === "collapsed" &&
          "md:max-w-[calc(100%_-_var(--sidebar-width-icon))]",
        state === "expanded" && "md:max-w-[calc(100%_-_var(--sidebar-width))]"
      )}
    >
      {children}
    </main>
  );
};
