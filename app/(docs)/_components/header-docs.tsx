import Link from "next/link";
import { Headphones, LucideIcon, User2 } from "lucide-react";
import React from "react";
import { User } from "@supabase/supabase-js";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/universal/logo";
import { Database } from "@/database.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export const HeaderDocs = ({ user }: { user: User | null }) => {
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
      </div>
      
    </header>
  );
};
