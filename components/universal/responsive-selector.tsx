"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Database } from "@/database.types";

interface Item {
  id: number;
  name: string;
}

interface ResponsiveSelectorProps {
  label: string;
  items: Item[];
  value: number | null | undefined;
  onChange: (value: number) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  sheetTitle: string;
  sheetDescription: string;
}

export default function ResponsiveSelector({
  label,
  items,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  sheetTitle,
  sheetDescription,
}: ResponsiveSelectorProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Comprobar al cargar
    checkIfMobile();

    // Listener para cambios de tamaño
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Filtrar items por búsqueda
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Seleccionar un item en mobile
  const selectItem = (item: Item) => {
    onChange(item.id);
    setOpenSheet(false);
    setSearchTerm("");
  };

  const selectedItem = items.find((item) => item.id === value);

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-between",
                !value && "text-muted-foreground"
              )}
            >
              {selectedItem?.name || placeholder}
              <ChevronsUpDown className="h-4 w-4 shrink-0" />
            </Button>
          </FormControl>
        </SheetTrigger>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn("p-0 bg-background", isMobile && "h-[80%] max-h-[80%]")}
        >
          <div className="flex h-full w-full flex-col">
            <SheetHeader className="text-start p-3 border-b bg-sidebar flex flex-col gap-y-4 space-y-0">
              <span className="w-full">
                <SheetTitle>{sheetTitle}</SheetTitle>
                <SheetDescription>{sheetDescription}</SheetDescription>
              </span>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder={searchPlaceholder}
                  className="pl-8 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <X
                    className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                )}
              </div>
            </SheetHeader>
            <div className="p-3 bg-background flex min-h-0 flex-1 flex-col gap-2 overflow-auto gap-y-1">
              {filteredItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={value === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "flex items-center justify-between w-full text-muted-foreground"
                    )}
                    onClick={() => selectItem(item)}
                  >
                    <span className="flex items-center">{item.name}</span>
                    {value === item.id && <Check className="h-4 w-4" />}
                  </Button>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <FormMessage />
    </FormItem>
  );
}
