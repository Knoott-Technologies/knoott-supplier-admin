"use client";

import type { Database } from "@/database.types";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Logo } from "../logo";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { NavigationMenuMobile } from "./navigation-menu-mobile";
import Image from "next/image";

type UserBusinessType =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

interface NavProps {
  label: string;
  href: string;
  icon?: LucideIcon;
  blank?: boolean;
}

const nav: NavProps[] = [
  {
    label: "Producto",
    href: "/product",
  },
  // {
  //   label: "Documentación",
  //   href: "/docs",
  // },
];

export const HeaderWebsite = ({
  user,
  userBusinesses,
  theme = "dynamic",
}: {
  user: User | null;
  userBusinesses: UserBusinessType[] | null;
  theme?: "dynamic" | "black" | "white";
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Lógica para detectar si ha scrolleado la pantalla
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Añadir el event listener cuando el componente se monta
    window.addEventListener("scroll", handleScroll);

    // Comprobar la posición inicial
    handleScroll();

    // Limpiar el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getTextColor = () => {
    if (isScrolled) {
      return "text-foreground"; // Always dark text when scrolled
    }

    // When not scrolled
    if (theme === "black") {
      return "text-foreground"; // Black text for black theme
    }

    return "text-background"; // White text for white theme or dynamic
  };

  // Determine logo variant
  const getLogoVariant = () => {
    if (isScrolled) {
      return "black"; // Always black logo when scrolled
    }

    // When not scrolled
    if (theme === "black") {
      return "black"; // Black logo for black theme
    }

    return "white"; // White logo for white theme or dynamic
  };

  // Determine button variant for CTA
  const getButtonVariant = () => {
    if (isScrolled) {
      return "defaultBlack";
    }

    if (theme === "black") {
      return "defaultBlack";
    }

    return "outline";
  };

  // Determine secondary button variant
  const getSecondaryButtonVariant = () => {
    if (isScrolled) {
      return "defaultBlack";
    }

    if (theme === "black") {
      return "defaultBlack";
    }

    return "secondary";
  };

  return (
    <div
      className={cn(
        "w-full items-center justify-between flex px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-3 h-14 fixed top-0 left-0 z-20 border-b border-transparent ease-in-out duration-300",
        isScrolled && "bg-sidebar border-border shadow-md"
      )}
    >
      <div className="w-auto h-full items-center justify-start flex gap-x-10">
        <Link href="/" className="h-full">
          <Logo variant={getLogoVariant()} />
        </Link>
        {/* <div className="items-center justify-start gap-x-1 hidden lg:flex">
          {nav.map((item, index) => (
            <Button
              size={"sm"}
              key={index}
              variant="link"
              className={cn("gap-x-1", getTextColor())}
              asChild
            >
              <Link href={item.href} target={item.blank ? "_blank" : undefined}>
                {item.label} {item.icon && <item.icon />}
              </Link>
            </Button>
          ))}
        </div> */}
      </div>
      <div className="h-full items-center justify-end gap-2 hidden lg:flex">
        {(user && (
          <Button variant={getButtonVariant()} size={"default"} asChild>
            <Link href={`/dashboard/`}>
              Entrar a mi dashboard
              <span className="flex -space-x-[0.45rem]">
                {userBusinesses &&
                  user &&
                  userBusinesses.length > 0 &&
                  userBusinesses.map((business) => (
                    <span
                      key={business.id}
                      className="rounded-full ring-1 overflow-hidden"
                    >
                      <Image
                        src={
                          business.business.business_logo_url ||
                          "/placeholder.svg"
                        }
                        width={16}
                        height={16}
                        alt="Avatar 01"
                      />
                    </span>
                  ))}
              </span>
            </Link>
          </Button>
        )) || (
          <>
            <Button variant={"ghost"} className={getTextColor()} asChild>
              <Link href="/login">Ingresa a tu cuenta</Link>
            </Button>
            <Button variant={"defaultBlack"} asChild>
              <Link href="/login">
                Comienza ahora <ArrowRight />
              </Link>
            </Button>
          </>
        )}
      </div>
      <div className="h-full items-center justify-end gap-1 lg:hidden">
        <NavigationMenuMobile
          user={user}
          userBusinesses={userBusinesses}
          isScrolled={isScrolled}
        />
      </div>
    </div>
  );
};
