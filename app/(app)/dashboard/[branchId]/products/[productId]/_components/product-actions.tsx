"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
import { Database } from "@/database.types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  ChevronDown,
  ClipboardCopy,
  Eye,
  EyeClosed,
  Loader2,
  MoreVertical,
  Pen,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const ProductActions = ({
  branchId,
  product,
}: {
  branchId: string;
  product: Database["public"]["Tables"]["products"]["Row"] & {
    brand: Database["public"]["Tables"]["catalog_brands"]["Row"];
    subcategory: Database["public"]["Tables"]["catalog_collections"]["Row"];
  };
}) => {
  const isMobile = useIsMobile();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const router = useRouter();

  const isInReview = product.status === "requires_verification";

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

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="size-7"
          >
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
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className=" size-7">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer justify-between text-muted-foreground focus:text-foreground">
            Copiar ID <ClipboardCopy className="!size-3.5" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="cursor-pointer justify-between text-muted-foreground focus:text-foreground"
          >
            <Link
              href={`/dashboard/${branchId}/products/${product.id}/edit`}
              className="w-full"
            >
              Editar <Pen className="!size-3.5" />
            </Link>
          </DropdownMenuItem>

          {product.status === "draft" && (
            <DropdownMenuItem
              className="cursor-pointer justify-between text-muted-foreground focus:text-foreground"
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
            </DropdownMenuItem>
          )}
          {product.status === "active" && (
            <DropdownMenuItem
              className="cursor-pointer justify-between text-muted-foreground focus:text-foreground"
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
            </DropdownMenuItem>
          )}

          {product.status !== "archived" &&
            product.status !== "requires_verification" &&
            product.status !== "deleted" && (
              <DropdownMenuItem
                className="cursor-pointer justify-between text-muted-foreground focus:text-foreground"
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
              </DropdownMenuItem>
            )}

          {product.status === "archived" && (
            <DropdownMenuItem
              className="cursor-pointer justify-between text-muted-foreground focus:text-foreground"
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
            </DropdownMenuItem>
          )}

          {product.status === "deleted" && (
            <DropdownMenuItem
              className="cursor-pointer justify-between text-muted-foreground focus:text-foreground"
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
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isInReview || product.status === "deleted"}
            className="cursor-pointer justify-between text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            Eliminar <Trash2 className="!size-3.5" />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
