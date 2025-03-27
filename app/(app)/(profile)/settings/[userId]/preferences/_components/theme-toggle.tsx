"use client";

import * as React from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Después de montar el componente, podemos acceder de manera segura al tema
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Evita renderizar contenido basado en el tema hasta que estemos en el cliente
  if (!mounted) {
    return (
      <Button variant="outline" size="sm">
        <ChevronDown />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {theme === "light" && (
            <>
              Knoott
              <div className="flex items-center justify-start gap-x-0 border divide-x">
                <span className="size-4 bg-[#ffffff]" />
                <span className="size-4 bg-[#FFBE19]" />
                <span className="size-4 bg-[#F5F5F4]" />
                <span className="size-4 bg-[#606060]" />
              </div>
            </>
          )}
          {theme === "classy" && (
            <>
              Clásico
              <div className="flex items-center justify-start gap-x-0 border divide-x">
                <span className="size-4 bg-[#F6F5F3]" />
                <span className="size-4 bg-[#AC7339]" />
                <span className="size-4 bg-[#C1C18B]" />
                <span className="size-4 bg-[#E5E2DC]" />
              </div>
            </>
          )}
          {theme === "otono" && (
            <>
              Otoño
              <div className="flex items-center justify-start gap-x-0 border divide-x">
                <span className="size-4 bg-[#F8F5F2]" />
                <span className="size-4 bg-[#CC5933]" />
                <span className="size-4 bg-[#EBC247]" />
                <span className="size-4 bg-[#E0D9D1]" />
              </div>
            </>
          )}
          {theme === "panal" && (
            <>
              Sketch
              <div className="flex items-center justify-start gap-x-0 border divide-x">
                <span className="size-4 bg-[#FFFFFF]" />
                <span className="size-4 bg-[#B8A000]" />
                <span className="size-4 bg-[#E8E8E8]" />
                <span className="size-4 bg-[#D1D1D1]" />
              </div>
            </>
          )}
          {theme === "noir" && (
            <>
              Noir
              <div className="flex items-center justify-start gap-x-0 border divide-x">
                <span className="size-4 bg-[#FFFFFF]" />
                <span className="size-4 bg-[#0D0D0D]" />
                <span className="size-4 bg-[#F2F2F2]" />
                <span className="size-4 bg-[#E6E5E5]" />
              </div>
            </>
          )}
          {theme === "elegant" && (
            <>
              Elegance
              <div className="flex items-center justify-start gap-x-0 border divide-x">
              <span className="size-4 bg-[#d19900]" />
            <span className="size-4 bg-[#ffffff]" />
            <span className="size-4 bg-[#fdf2d6]" />
            <span className="size-4 bg-[#f0ebe8]" />
              </div>
            </>
          )}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width]"
        align="end"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Knoott
          <div className="flex items-center justify-start gap-x-0 border divide-x ml-auto">
            <span className="size-4 bg-[#ffffff]" />
            <span className="size-4 bg-[#FFBE19]" />
            <span className="size-4 bg-[#F5F5F4]" />
            <span className="size-4 bg-[#606060]" />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-x-2"
          onClick={() => setTheme("classy")}
        >
          Clásico
          <div className="flex items-center justify-start gap-x-0 border divide-x ml-auto">
            <span className="size-4 bg-[#F6F5F3]" />
            <span className="size-4 bg-[#AC7339]" />
            <span className="size-4 bg-[#C1C18B]" />
            <span className="size-4 bg-[#E5E2DC]" />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-x-2" onClick={() => setTheme("noir")}>
          Noir
          <div className="flex items-center justify-start gap-x-0 border divide-x ml-auto">
            <span className="size-4 bg-[#FFFFFF]" />
            <span className="size-4 bg-[#0D0D0D]" />
            <span className="size-4 bg-[#F2F2F2]" />
            <span className="size-4 bg-[#E6E5E5]" />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-x-2" onClick={() => setTheme("otono")}>
          Otoño
          <div className="flex items-center justify-start gap-x-0 border divide-x ml-auto">
            <span className="size-4 bg-[#F8F5F2]" />
            <span className="size-4 bg-[#CC5933]" />
            <span className="size-4 bg-[#EBC247]" />
            <span className="size-4 bg-[#E0D9D1]" />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-x-2" onClick={() => setTheme("panal")}>
          Sketch
          <div className="flex items-center justify-start gap-x-0 border divide-x ml-auto">
            <span className="size-4 bg-[#FFFFFF]" />
            <span className="size-4 bg-[#B8A000]" />
            <span className="size-4 bg-[#E8E8E8]" />
            <span className="size-4 bg-[#D1D1D1]" />
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-x-2" onClick={() => setTheme("elegant")}>
          Elegance
          <div className="flex items-center justify-start gap-x-0 border divide-x ml-auto">
            <span className="size-4 bg-[#d19900]" />
            <span className="size-4 bg-[#ffffff]" />
            <span className="size-4 bg-[#fdf2d6]" />
            <span className="size-4 bg-[#f0ebe8]" />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
