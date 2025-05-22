"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface SearchableSelectProps {
  options: { id: string; name: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  disabled?: boolean;
  allowRequestNew?: boolean;
  entityType?: "brand" | "category";
  businessId?: string;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados",
  isLoading = false,
  disabled = false,
  allowRequestNew = false,
  entityType = "brand",
  businessId,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [newEntityName, setNewEntityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  // Update filtered options when options or search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredOptions(options);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = options.filter((option) =>
      option.name.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredOptions(filtered);
  }, [options, searchTerm]);

  // Get the selected option name
  const selectedOption = options.find((option) => option.id === value);

  // Handle requesting a new entity
  const handleRequestNew = async () => {
    if (!newEntityName.trim()) {
      toast.error(
        `Por favor, ingresa un nombre para la ${entityType === "brand" ? "marca" : "categoría"}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (entityType === "brand") {
        // Check if a brand with this name already exists
        const { data: existingBrands } = await supabase
          .from("catalog_brands")
          .select("id, name")
          .ilike("name", newEntityName.trim());

        if (existingBrands && existingBrands.length > 0) {
          toast.error(
            `Ya existe una marca con un nombre similar: "${existingBrands[0].name}"`
          );
          setIsSubmitting(false);
          return;
        }

        // Insert new brand with active status instead of on_revision
        const { data, error } = await supabase
          .from("catalog_brands")
          .insert({
            name: newEntityName.trim(),
            status: "on_revision", // Set as active immediately
          })
          .select();

        if (error) {
          throw error;
        }

        toast.success("Nueva marca solicitada y seleccionada correctamente");

        // Close the dialog and reset the form
        setShowRequestDialog(false);
        setNewEntityName("");
        setOpen(false);

        // Select the newly created brand immediately
        if (data && data[0]) {
          // Add the new brand to options so it appears in the dropdown
          const newBrand = data[0];
          const updatedOptions = [...options, newBrand];
          // This will trigger a re-render with the new options
          // We're assuming the parent component will handle this properly
          onValueChange(newBrand.id);
        }
      } else {
        // Handle category request if needed in the future
        toast.error(
          "La solicitud de nuevas categorías no está disponible actualmente"
        );
      }
    } catch (error) {
      console.error("Error requesting new entity:", error);
      toast.error(
        `Error al crear nueva ${entityType === "brand" ? "marca" : "categoría"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-sidebar"
            disabled={disabled}
          >
            {value && selectedOption ? selectedOption.name : placeholder}
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 opacity-50 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => {
                        onValueChange(option.id);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {allowRequestNew && entityType === "brand" && (
                <>
                  <CommandGroup className="bg-sidebar border-t">
                    <CommandItem
                      onSelect={() => {
                        setShowRequestDialog(true);
                        setOpen(false);
                      }}
                      className="text-foreground"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Solicitar nueva marca
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog for requesting a new entity */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva marca</DialogTitle>
            <DialogDescription>
              Ingresa el nombre de la marca que deseas crear. La marca estará
              disponible inmediatamente para su uso.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="entityName">Nombre de la marca</Label>
              <Input
                id="entityName"
                placeholder="Ej: Nike, Adidas, etc."
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRequestDialog(false);
                setNewEntityName("");
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequestNew}
              disabled={isSubmitting || !newEntityName.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear y seleccionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
