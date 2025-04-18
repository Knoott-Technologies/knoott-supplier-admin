"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar";
import Link from "next/link";

interface AnnouncementProps {
  title: string;
  description: string;
  href?: string;
}

export function Announcement({ title, description, href }: AnnouncementProps) {
  const { state } = useSidebar();
  const Content = () => (
    <div className="flex flex-col gap-y-1 border bg-background p-2 transition-all hover:-translate-y-0.5 hover:shadow-sm">
      <h5 className="text-sm font-semibold">{title}</h5>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div className={cn("w-full", state === "collapsed" && "hidden")}>
      {href ? (
        <Link href={href} className="relative z-20 block h-fit w-full pt-0">
          <Content />
        </Link>
      ) : (
        <div className="relative z-20 block h-fit w-full pt-0">
          <Content />
        </div>
      )}
    </div>
  );
}
