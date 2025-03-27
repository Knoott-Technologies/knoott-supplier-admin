"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  Loader2,
  Check,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Database } from "@/database.types";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditAddressForm } from "./edit-address-form";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AddressesDropdownProps {
  address: Database["public"]["Tables"]["wedding_addresses"]["Row"];
}

export const AddressesDropdown = ({ address }: AddressesDropdownProps) => {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Hook para detectar tamaño de pantalla
  const isMobile = useIsMobile();

  // Función para eliminar dirección
  const handleDeleteAddress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/addresses/${address.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la dirección");
      }

      toast.success("Dirección eliminada correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error al eliminar dirección:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar la dirección"
      );
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Función para establecer como dirección predeterminada
  const handleSetDefault = async () => {
    if (address.is_default) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/addresses/${address.id}/default`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al actualizar la dirección predeterminada"
        );
      }

      toast.success("Dirección predeterminada actualizada");
      router.refresh();
    } catch (error) {
      console.error("Error al establecer dirección predeterminada:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar la dirección predeterminada"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"ghost"}
            className="size-7"
            size={"icon"}
            disabled={isLoading}
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px]" align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer justify-between"
              onClick={() => setIsEditSheetOpen(true)}
            >
              Editar dirección <Pencil className="!size-3.5" />
            </DropdownMenuItem>

            {!address.is_default && (
              <DropdownMenuItem
                className="cursor-pointer justify-between"
                onClick={handleSetDefault}
              >
                Establecer como predeterminada <Star className="!size-3.5" />
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="cursor-pointer justify-between text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Eliminar <Trash2 className="!size-3.5" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sheet para editar dirección */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            isMobile ? "h-[80dvh] max-h-[80dvh]" : "",
            "bg-sidebar p-0"
          )}
        >
          <div className="flex h-full w-full flex-col">
            <SheetHeader className="bg-sidebar border-b p-3 text-start">
              <SheetTitle>Editar dirección</SheetTitle>
              <SheetDescription>
                Modifica los datos de la dirección seleccionada
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto bg-background p-3">
              <EditAddressForm
                address={address}
                onSuccess={() => {
                  setIsEditSheetOpen(false);
                }}
                setIsSubmitting={setIsSubmitting}
              />
            </div>
            <SheetFooter className="border-t bg-sidebar p-3 pb-8 md:pb-3">
              <Button
                form="address-form"
                variant={"defaultBlack"}
                size={"sm"}
                className="w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>Guardar cambios</>
                )}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog para confirmar eliminación */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres
              eliminar esta dirección?
              {address.is_default && (
                <p className="mt-2 font-medium text-destructive">
                  Esta es tu dirección predeterminada. Si la eliminas, tendrás
                  que elegir otra dirección como predeterminada.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAddress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
