import Link from "next/link";
import { Headphones, LucideIcon } from "lucide-react";
import React from "react";
import { User } from "@supabase/supabase-js";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/universal/logo";

interface NavProps {
  name: string;
  href: string;
  variant:
    | "ghost"
    | "default"
    | "destructive"
    | "secondary"
    | "link"
    | "defaultBlack";
  icon: LucideIcon;
}

export const HeaderPlatform = ({ user }: { user: User }) => {
  const nav: NavProps[] = [
    {
      name: "Soporte",
      href: "/support",
      variant: "ghost",
      icon: Headphones,
    },
  ];

  return (
    <header className="w-full h-12 py-2 flex items-center justify-between px-2 bg-sidebar border-b sticky top-0 z-50">
      <div className="h-full flex gap-x-4 lg:gap-x-7 flex-1 items-center justify-start">
        <SidebarTrigger variant={"outline"} className="flex" />
        <Link
          href={"/"}
          className="h-8 lg:h-full lg:flex lg:static lg:transform-none lg:translate-x-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <Logo variant={"black"} />
        </Link>
      </div>
      <div className="w-fit h-full items-center justify-end gap-1 flex"></div>
    </header>
  );
};
