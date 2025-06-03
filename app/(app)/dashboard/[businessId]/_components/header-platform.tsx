import Link from "next/link";
import { Headphones, LucideIcon, User2 } from "lucide-react";
import React from "react";
import { User } from "@supabase/supabase-js";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "@/components/universal/logo";
import { Database } from "@/database.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportPopover } from "./support-popover";
import { FeedBackPopover } from "./feedback-popover";

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

export const HeaderPlatform = ({
  user,
  role,
}: {
  user: User;
  role: Database["public"]["Enums"]["provider_businees_user_roles"];
}) => {
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
      <div className="w-fit h-full items-center justify-end gap-1 flex lg:hidden">
        <Button
          variant={"ghost"}
          size={"icon"}
          className={cn(
            "size-7 pointer-events-none",
            role === "admin"
              ? "text-contrast bg-contrast/10 hover:text-contrast hover:bg-contrast/10"
              : role === "supervisor"
                ? "text-contrast2 bg-contrast2/10 hover:text-contrast2 hover:bg-contrast2/10"
                : "text-tertiary bg-tertiary/10 hover:text-tertiary hover:bg-tertiary/10"
          )}
        >
          <User2 />
        </Button>
        <SupportPopover />
      </div>
      <div className="w-fit h-full items-center justify-end gap-1 lg:flex hidden">
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn(
            "h-7 pointer-events-none",
            role === "admin"
              ? "text-contrast bg-contrast/10 hover:text-contrast hover:bg-contrast/10"
              : role === "supervisor"
                ? "text-contrast2 bg-contrast2/10 hover:text-contrast2 hover:bg-contrast2/10"
                : "text-tertiary bg-tertiary/10 hover:text-tertiary hover:bg-tertiary/10"
          )}
        >
          {role === "admin"
            ? "Administrador"
            : role === "supervisor"
              ? "Supervisor"
              : "Staff"}
        </Button>
        <SupportPopover />
        <FeedBackPopover user={user} />
        {/* {nav.map((item, index) => (
          <Button
            variant={"outline"}
            key={index}
            size={"sm"}
            className="h-7"
            asChild
          >
            <Link
              href={item.href}
              className="h-full flex items-center justify-center"
            >
              {item.name}
              <item.icon className="h-6 w-6" />
            </Link>
          </Button>
        ))} */}
      </div>
    </header>
  );
};
