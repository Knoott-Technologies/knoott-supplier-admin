import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Database } from "@/database.types";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "../logo";

type UserBusinessType =
  Database["public"]["Tables"]["provider_business_users"]["Row"] & {
    business: Database["public"]["Tables"]["provider_business"]["Row"];
  };

export const NavigationMenuMobile = ({
  user,
  isScrolled,
  userBusinesses,
  theme = "dynamic",
}: {
  user: User | null;
  userBusinesses: UserBusinessType[] | null;
  isScrolled: boolean;
  theme?: "dynamic" | "black" | "white";
}) => {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className={cn("lg:hidden", getTextColor())}
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="[&>button]:hidden p-0 bg-sidebar w-full">
        <div className="flex h-full w-full flex-col">
          <SheetHeader className="p-3 h-14 bg-sidebar border-b text-start space-y-0">
            <div className="w-full h-full items-center justify-between flex">
              <SheetClose asChild>
                <Link href="/" className="h-full">
                  <Logo variant={"black"} />
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Button variant={"outline"} size={"icon"}>
                  <X />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto bg-background p-3">
            <div className="w-full h-fit items-start justify-start flex flex-col gap-y-1">
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="px-3 w-full flex items-center justify-between text-muted-foreground"
                  asChild
                  size={"lg"}
                >
                  <Link href="/">
                    Inicio <ArrowRight />
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="px-3 w-full flex items-center justify-between text-muted-foreground"
                  asChild
                  size={"lg"}
                >
                  <Link href="/product">
                    Producto <ArrowRight />
                  </Link>
                </Button>
              </SheetClose>
              {/* <SheetClose asChild>
                <Button
                  variant="ghost"
                  className="px-3 w-full flex items-center justify-between text-muted-foreground"
                  asChild
                  size={"lg"}
                >
                  <Link href="/docs">
                    Documentación <ArrowRight />
                  </Link>
                </Button>
              </SheetClose> */}
            </div>
            {!user && (
              <SheetClose asChild>
                <Link
                  href={"/register"}
                  className="w-full bg-sidebar border p-3 mt-auto relative aspect-[16/6] flex flex-col"
                >
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                      src="/kn-retail.jpg"
                      alt="Knoott Suppliers Logo"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute inset-0 z-[1] bg-foreground/70" />
                  </div>
                  <div className="w-full relative z-[1] flex flex-col flex-1 justify-between">
                    <span className="self-end text-background text-sm flex gap-x-1 items-center">
                      <ArrowRight className="size-4" />
                    </span>
                    <span>
                      <h3 className="text-background font-semibold">
                        Knoott Partners
                      </h3>
                      <p className="text-sm text-background/90">
                        Comienza ahora con nosotros, aumenta tus ventas y
                        posiciona tu marca.
                      </p>
                    </span>
                  </div>
                </Link>
              </SheetClose>
            )}
          </div>
          <SheetFooter className="w-full bg-sidebar border-t p-3 pb-8 md:pb-3 flex flex-col sm:flex-col gap-y-2">
            {(user && !userBusinesses && (
              <SheetClose asChild>
                <Button variant={"defaultBlack"} className="w-full">
                  Registra tu negocio
                </Button>
              </SheetClose>
            )) ||
              (userBusinesses && userBusinesses.length > 0 && (
                <SheetClose asChild>
                  <Button
                    variant={"defaultBlack"}
                    className="w-full md:w-auto"
                    asChild
                  >
                    <Link href={`/dashboard`}>Entrar a mi dashboard</Link>
                  </Button>
                </SheetClose>
              )) || (
                <>
                  <SheetClose asChild>
                    <Button variant={"outline"} className="w-full" asChild>
                      <Link href="/login">Ingresa a tu cuenta</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant={"defaultBlack"} className="w-full">
                      Unirse a Knoott Suppliers
                    </Button>
                  </SheetClose>
                </>
              )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
