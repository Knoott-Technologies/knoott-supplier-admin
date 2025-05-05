"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ArrowRight, Headset, Mail, X } from "lucide-react";
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { WhatsApp } from "@/components/svgs/icons";

export const SupportPopover = () => {
  const isMobile = useIsMobile();

  const SupportLinks = () => (
    <>
      <div className="py-1">
        <div className="px-2 py-1.5 text-sm font-medium">
          ¿Tuviste algún problema?, Contáctanos por:
        </div>
        <div className="my-1 h-px bg-border" />
        <div className="py-1">
          <Link
            className="relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            href="https://wa.me/+528717544123"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="gap-x-2 flex items-center justify-start">
              <WhatsApp className="size-4" />
              WhatsApp
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="py-1">
          <Link
            className="relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            href="mailto:soporte@knoott.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="gap-x-2 flex items-center justify-start">
              <Mail className="size-4" />
              soporte@knoott.com
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </>
  );

  // Versión móvil con Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button size={"icon"} variant={"outline"} className="flex size-7">
            <Headset className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="text-left p-3 bg-sidebar border-b">
            <SheetTitle>Soporte</SheetTitle>
            <SheetDescription>
              Estamos aquí para ayudarte con cualquier problema
            </SheetDescription>
          </SheetHeader>
          <div className="p-3">
            <SupportLinks />
          </div>
          <SheetFooter className="w-full bg-sidebar p-3 pb-8 md:pb-3 border-t">
            <SheetClose asChild>
              <Button variant={"defaultBlack"} className="w-full">
                Cerrar <X />
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // Versión desktop con DropdownMenu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="lg:flex hidden" variant={"outline"} size={"sm"}>
          Soporte
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="min-w-[300px]">
        <DropdownMenuLabel>
          ¿Tuviste algún problema?, Contáctanos por:
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link
            className="flex items-center justify-between flex-1"
            href="https://wa.me/+528717544123"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="gap-x-2 flex items-center justify-start">
              <WhatsApp className="size-4" />
              WhatsApp
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link
            className="flex items-center justify-between flex-1"
            href="mailto:soporte@knoott.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="gap-x-2 flex items-center justify-start">
              <Mail className="size-4" />
              soporte@knoott.com
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
