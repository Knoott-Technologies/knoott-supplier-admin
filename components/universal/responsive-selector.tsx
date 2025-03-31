"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Check, ChevronsUpDown, Search, X, Plus, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

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
  const [openSheet, setOpenSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Reset states when sheet is closed
  useEffect(() => {
    if (!openSheet) {
      setSearchTerm("");
      setIsAddingNew(false);
      setNewItemName("");
    }
  }, [openSheet]);

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

  // Handle adding a new brand
  const handleAddNewItem = async () => {
    if (!newItemName.trim()) {
      toast.error("Error", { description: "El nombre no puede estar vacío" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/brands/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItemName,
          status: "on_revision",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear la marca");
      }

      const newBrand = await response.json();

      // Add the new brand to the local items list
      const updatedItems = [...items, newBrand];

      // Select the newly created brand
      onChange(newBrand.id);

      // Close sheet
      setOpenSheet(false);

      // Reset states
      setIsAddingNew(false);
      setNewItemName("");

      toast.success("Marca creada", {
        description: "La marca ha sido creada y está en revisión",
      });
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error("Error", { description: "No se pudo crear la marca" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {filteredItems.length === 0 && !searchTerm ? (
                <div className="text-center py-4 text-muted-foreground">
                  {emptyMessage}
                </div>
              ) : (
                <>
                  {filteredItems.map((item) => (
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
                  ))}

                  {/* Add new item option - only shows when searching */}
                  {searchTerm && !isAddingNew && (
                    <Button
                      variant="secondary"
                      className="w-full flex items-center justify-between text-muted-foreground"
                      onClick={() => {
                        setNewItemName(searchTerm);
                        setIsAddingNew(true);
                      }}
                    >
                      <span>
                        Solicitar &quot;{searchTerm}&quot; como nueva marca
                      </span>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                  {/* New item input field */}
                  {isAddingNew && (
                    <div className="p-3 bg-sidebar border flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Nombre de la marca"
                          className="flex-1 bg-background"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setIsAddingNew(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          variant="defaultBlack"
                          className="flex-1"
                          onClick={handleAddNewItem}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Cargando...
                            </>
                          ) : (
                            "Solicitar marca"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        La marca será agregada con estado &quot;en
                        revisión&quot; y estará disponible una vez aprobada.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <FormMessage />
    </FormItem>
  );
}
