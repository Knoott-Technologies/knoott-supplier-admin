"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { EllipsisIcon, Loader2 } from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Product } from "./columns";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const params = useParams();
  const branchId = params.branchId as string;

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Determinar si el producto está en revisión
  const isInReview = product.status === "requires_verification";

  // Función para cambiar el estado del producto
  const updateProductStatus = async (newStatus: string) => {
    if (isInReview) {
      toast.error("No se puede modificar un producto en revisión");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/products/${product.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del producto");
      }

      toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Error al actualizar el estado del producto");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Función para eliminar el producto (soft-delete)
  const deleteProduct = async () => {
    if (isInReview) {
      toast.error("No se puede eliminar un producto en revisión");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      toast.success("Producto eliminado correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar el producto");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Función para obtener la etiqueta del estado
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "draft":
        return "Borrador";
      case "active":
        return "Activo";
      case "archived":
        return "Archivado";
      case "requires_verification":
        return "En revisión";
      case "deleted":
        return "Eliminado";
      default:
        return status;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={"icon"} className="size-7">
            <span className="sr-only">Abrir menú</span>
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(product.id.toString())}
          >
            Copiar ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (isInReview) {
                toast.error("No se puede editar un producto en revisión");
                return;
              }
              router.push(
                `/dashboard/${branchId}/products/edit/${product.id}/general-info`
              );
            }}
            disabled={isInReview}
          >
            Editar producto
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Cambiar estado según el estado actual */}
          {product.status === "draft" && (
            <DropdownMenuItem
              onClick={() => updateProductStatus("active")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Publicar producto"
              )}
            </DropdownMenuItem>
          )}

          {product.status === "active" && (
            <DropdownMenuItem
              onClick={() => updateProductStatus("draft")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Despublicar producto"
              )}
            </DropdownMenuItem>
          )}

          {product.status !== "archived" &&
            product.status !== "requires_verification" &&
            product.status !== "deleted" && (
              <DropdownMenuItem
                onClick={() => updateProductStatus("archived")}
                disabled={isInReview || isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Archivar producto"
                )}
              </DropdownMenuItem>
            )}

          {product.status === "archived" && (
            <DropdownMenuItem
              onClick={() => updateProductStatus("draft")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Restaurar producto"
              )}
            </DropdownMenuItem>
          )}

          {product.status === "deleted" && (
            <DropdownMenuItem
              onClick={() => updateProductStatus("draft")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Restaurar producto"
              )}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isInReview || product.status === "deleted"}
          >
            Eliminar producto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será marcado como
              eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteProduct();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
