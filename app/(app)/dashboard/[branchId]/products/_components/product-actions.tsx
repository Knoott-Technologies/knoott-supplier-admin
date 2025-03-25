"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  ClipboardCopy,
  EllipsisIcon,
  Eye,
  EyeClosed,
  Loader2,
  MoreVertical,
  Pen,
  Trash2,
} from "lucide-react";
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
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { Separator } from "@/components/ui/separator";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const params = useParams();
  const branchId = params.branchId as string;
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-7">
              <MoreVertical />
            </Button>
          </SheetTrigger>
          <SheetContent
            side={"bottom"}
            className="bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          >
            <div className="flex h-full w-full flex-col">
              <SheetHeader className="p-3 bg-sidebar text-start border-b">
                <SheetTitle>Acciones</SheetTitle>
                <SheetDescription>
                  ¿Que quieres hacer con este producto?
                </SheetDescription>
              </SheetHeader>
              <div className="w-full py-3 bg-background flex flex-col gap-y-2">
                <div className="w-full h-fit items-start justify-start flex flex-col gap-y-2 px-3">
                  <Button variant={"ghost"} className="w-full justify-between">
                    Copiar ID <ClipboardCopy className="!size-3.5" />
                  </Button>
                </div>
                <Separator />
                <div className="w-full h-fit items-start justify-start flex flex-col gap-y-2 px-3">
                  <Button
                    asChild
                    variant={"ghost"}
                    className="w-full justify-between"
                  >
                    <Link
                      href={`/dashboard/${branchId}/products/${product.id}/edit`}
                      className="w-full"
                    >
                      Editar <Pen className="!size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant={"ghost"}
                    className="w-full justify-between"
                    asChild
                  >
                    <Link
                      href={`/dashboard/${branchId}/products/${product.id}`}
                    >
                      Ver detalles
                      <ArrowRight className="!size-3.5" />
                    </Link>
                  </Button>

                  {product.status === "draft" && (
                    <Button
                      className="w-full justify-between"
                      variant={"ghost"}
                      onClick={() => updateProductStatus("active")}
                      disabled={isInReview || isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <>
                          Actualizando...
                          <Loader2 />
                        </>
                      ) : (
                        <>
                          Publicar producto
                          <Eye className="!size-3.5" />
                        </>
                      )}
                    </Button>
                  )}
                  {product.status === "active" && (
                    <Button
                      className="w-full justify-between"
                      variant={"ghost"}
                      onClick={() => updateProductStatus("draft")}
                      disabled={isInReview || isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <>
                          Actualizando...
                          <Loader2 />
                        </>
                      ) : (
                        <>
                          Desactivar producto
                          <EyeClosed className="!size-3.5" />
                        </>
                      )}
                    </Button>
                  )}

                  {product.status !== "archived" &&
                    product.status !== "requires_verification" &&
                    product.status !== "deleted" && (
                      <Button
                        className="w-full justify-between"
                        variant={"ghost"}
                        onClick={() => updateProductStatus("archived")}
                        disabled={isInReview || isUpdatingStatus}
                      >
                        {isUpdatingStatus ? (
                          <>
                            Actualizando...
                            <Loader2 />
                          </>
                        ) : (
                          <>
                            Archivar producto
                            <Archive className="!size-3.5" />
                          </>
                        )}
                      </Button>
                    )}

                  {product.status === "archived" && (
                    <Button
                      className="w-full justify-between"
                      variant={"ghost"}
                      onClick={() => updateProductStatus("draft")}
                      disabled={isInReview || isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <>
                          Actualizando...
                          <Loader2 />
                        </>
                      ) : (
                        <>
                          Restaurar producto
                          <ArchiveRestore className="!size-3.5" />
                        </>
                      )}
                    </Button>
                  )}

                  {product.status === "deleted" && (
                    <Button
                      className="w-full justify-between"
                      variant={"ghost"}
                      onClick={() => updateProductStatus("draft")}
                      disabled={isInReview || isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <>
                          Actualizando...
                          <Loader2 />
                        </>
                      ) : (
                        <>
                          Restaurar producto
                          <ArchiveRestore className="!size-3.5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="w-full h-fit items-start justify-start flex flex-col gap-y-2 px-3">
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isInReview || product.status === "deleted"}
                    variant={"ghost"}
                    className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Eliminar <Trash2 className="!size-3.5" />
                  </Button>
                </div>
              </div>
              <SheetFooter className="pb-8 md:pb-3 p-3 border-t bg-sidebar">
                <SheetClose asChild>
                  <Button variant={"defaultBlack"} className="w-full">
                    Cancelar
                  </Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
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
                    <Loader2 className="!size-3.5 animate-spin" />
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={"icon"} className="size-7">
            <span className="sr-only">Abrir menú</span>
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            className="text-muted-foreground justify-between cursor-pointer"
            onClick={() => navigator.clipboard.writeText(product.id.toString())}
          >
            Copiar ID
            <ClipboardCopy className="!size-3.5" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-muted-foreground justify-between cursor-pointer"
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
            <Pen className="!size-3.5" />
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-muted-foreground justify-between cursor-pointer"
            asChild
          >
            <Link href={`/dashboard/${branchId}/products/${product.id}`}>
              Ver detalles
              <ArrowRight className="!size-3.5" />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Cambiar estado según el estado actual */}
          {product.status === "draft" && (
            <DropdownMenuItem
              className="text-muted-foreground justify-between cursor-pointer"
              onClick={() => updateProductStatus("active")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  Actualizando...
                  <Loader2 className="!size-3.5 animate-spin" />
                </>
              ) : (
                <>
                  Publicar producto
                  <Eye className="!size-3.5" />
                </>
              )}
            </DropdownMenuItem>
          )}

          {product.status === "active" && (
            <DropdownMenuItem
              className="text-muted-foreground justify-between cursor-pointer"
              onClick={() => updateProductStatus("draft")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="!size-3.5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  Despublicar producto
                  <EyeClosed className="!size-3.5" />
                </>
              )}
            </DropdownMenuItem>
          )}

          {product.status !== "archived" &&
            product.status !== "requires_verification" &&
            product.status !== "deleted" && (
              <DropdownMenuItem
                className="text-muted-foreground justify-between cursor-pointer"
                onClick={() => updateProductStatus("archived")}
                disabled={isInReview || isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="!size-3.5 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Archivar producto
                    <Archive className="!size-3.5" />
                  </>
                )}
              </DropdownMenuItem>
            )}

          {product.status === "archived" && (
            <DropdownMenuItem
              className="text-muted-foreground justify-between cursor-pointer"
              onClick={() => updateProductStatus("draft")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="!size-3.5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  Restaurar producto
                  <ArchiveRestore className="!size-3.5" />
                </>
              )}
            </DropdownMenuItem>
          )}

          {product.status === "deleted" && (
            <DropdownMenuItem
              className="text-muted-foreground justify-between cursor-pointer"
              onClick={() => updateProductStatus("draft")}
              disabled={isInReview || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="!size-3.5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  Restaurar producto
                  <ArchiveRestore className="!size-3.5" />
                </>
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
                  <Loader2 className="!size-3.5 animate-spin" />
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
