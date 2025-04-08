"use client";

import type { Database } from "@/database.types";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Logo } from "../logo";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserDropdown } from "./user-dropdown";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { NavigationMenuMobile } from "./navigation-menu-mobile";

type UserBusinessType =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

export const HeaderWebsite = ({
  user,
  userBusinesses,
}: {
  user: User | null;
  userBusinesses: UserBusinessType[] | null;
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

  return (
    <div
      className={cn(
        "w-full items-center justify-between flex px-5 md:px-7 lg:px-14 xl:px-36 2xl:px-56 py-3 h-14 fixed top-0 left-0 z-20 border-b border-transparent ease-in-out duration-300",
        isScrolled && "bg-sidebar border-border"
      )}
    >
      <Link href="/" className="h-full">
        <Logo variant={isScrolled ? "black" : "white"} />
      </Link>
      <div className="h-full items-center justify-end gap-1 hidden lg:flex">
        {(user && (
          <UserDropdown
            user={user}
            userBusinesses={userBusinesses}
            isScrolled={isScrolled}
          />
        )) || (
          <>
            <Button
              variant={isScrolled ? "secondary" : "ghost"}
              className={cn(
                "text-background border border-transparent",
                isScrolled && "text-foreground border-border bg-sidebar"
              )}
              asChild
            >
              <Link href="/login">
                Ingresa a tu cuenta <ArrowRight />
              </Link>
            </Button>
            <Button variant={"defaultBlack"} asChild>
              <Link href="/login">Comienza ahora</Link>
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
