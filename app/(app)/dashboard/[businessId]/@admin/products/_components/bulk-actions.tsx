"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  Check,
  CircleDashed,
  Eye,
  EyeOff,
  ListTree,
  Loader2,
  Tag,
  Truck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Product } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AmountInput } from "@/components/universal/amount-input";
import { SearchableSelect } from "./searchable-select";
import { CategoryTreeSelect } from "./category-tree-select";

interface BulkActionsProps {
  selectedProducts: Product[];
}

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  description?: string | null;
  image_url?: string | null;
  status?: string;
  level?: number;
}

export function BulkActions({ selectedProducts }: BulkActionsProps) {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId as string;
  const supabase = createClient();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingPopoverOpen, setIsShippingPopoverOpen] = useState(false);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch brands
        const { data: brandsData } = await supabase
          .from("catalog_brands")
          .select("id, name")
          .order("name");

        if (brandsData) {
          setBrands(brandsData);
        }

        // Fetch all categories to build the tree
        const { data: categoriesData } = await supabase
          .from("catalog_collections")
          .select("id, name, parent_id, description, image_url, status")
          .eq("status", "active") // Only show active categories
          .order("name");

        if (categoriesData) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, showBrandDialog]); // Re-fetch when brand dialog is opened/closed to get newly added brands

  // Get product IDs
  const productIds = selectedProducts.map((product) => product.id);

  // Check if any products are in review
  const hasProductsInReview = selectedProducts.some(
    (product) => product.status === "requires_verification"
  );

  // Check if all products are deleted
  const allProductsDeleted = selectedProducts.every(
    (product) => product.status === "deleted"
  );

  // Update product status
  const updateProductsStatus = async (newStatus: string) => {
    if (hasProductsInReview) {
      toast.error("No se pueden modificar productos en revisión");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/bulk/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds,
          status: newStatus,
          businessId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de los productos");
      }

      toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating products status:", error);
      toast.error("Error al actualizar el estado de los productos");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete products (soft-delete)
  const deleteProducts = async () => {
    if (hasProductsInReview) {
      toast.error("No se pueden eliminar productos en revisión");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/bulk/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds,
          businessId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar los productos");
      }

      toast.success("Productos eliminados correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error deleting products:", error);
      toast.error("Error al eliminar los productos");
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  // Update products brand
  const updateProductsBrand = async () => {
    if (hasProductsInReview) {
      toast.error("No se pueden modificar productos en revisión");
      return;
    }

    if (!selectedBrand) {
      toast.error("Selecciona una marca");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/bulk/brand`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds,
          brandId: selectedBrand,
          businessId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la marca de los productos");
      }

      toast.success("Marca actualizada correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error updating products brand:", error);
      toast.error("Error al actualizar la marca de los productos");
    } finally {
      setIsProcessing(false);
      setShowBrandDialog(false);
      setSelectedBrand("");
    }
  };

  // Update products category
  const updateProductsCategory = async () => {
    if (hasProductsInReview) {
      toast.error("No se pueden modificar productos en revisión");
      return;
    }

    if (!selectedCategory) {
      toast.error("Selecciona una colección");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/products/bulk/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds,
          categoryId: selectedCategory,
          businessId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la colección de los productos");
      }

      toast.success("Colección actualizada correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error updating products category:", error);
      toast.error("Error al actualizar la colección de los productos");
    } finally {
      setIsProcessing(false);
      setShowCategoryDialog(false);
      setSelectedCategory("");
    }
  };

  // Update shipping cost for multiple products
  const updateShippingCost = async () => {
    if (hasProductsInReview) {
      toast.error("No se pueden modificar productos en revisión");
      return;
    }

    setIsUpdatingShipping(true);
    try {
      const response = await fetch(`/api/products/bulk/shipping`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds,
          shippingCost,
          businessId,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el costo de envío");
      }

      toast.success("Costo de envío actualizado correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error updating shipping cost:", error);
      toast.error("Error al actualizar el costo de envío");
    } finally {
      setIsUpdatingShipping(false);
      setIsShippingPopoverOpen(false);
    }
  };

  // Function to get status label
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
      <div className="bg-muted/30 border rounded-md p-3 gap-2 flex flex-col xl:flex-row items-start xl:items-center justify-between">
        <div className="text-sm font-medium">
          {selectedProducts.length} producto
          {selectedProducts.length !== 1 ? "s" : ""} seleccionado
          {selectedProducts.length !== 1 ? "s" : ""}
        </div>
        <div className="flex flex-wrap xl:flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBrandDialog(true)}
            disabled={hasProductsInReview || allProductsDeleted}
          >
            <Tag className="h-4 w-4" />
            Asignar marca
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryDialog(true)}
            disabled={hasProductsInReview || allProductsDeleted}
          >
            <ListTree className="h-4 w-4" />
            Asignar colección
          </Button>

          <Popover
            open={isShippingPopoverOpen}
            onOpenChange={setIsShippingPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  hasProductsInReview ||
                  allProductsDeleted ||
                  isUpdatingShipping
                }
              >
                <Truck className="h-4 w-4" />
                Costo de envío
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="grid gap-0">
                <div className="space-y-2 p-3 border-b bg-sidebar">
                  <h4 className="font-medium leading-none">Costo de envío</h4>
                  <p className="text-sm text-muted-foreground">
                    Establece el costo de envío para los{" "}
                    {selectedProducts.length} producto
                    {selectedProducts.length !== 1 ? "s" : ""} seleccionado
                    {selectedProducts.length !== 1 ? "s" : ""}.
                  </p>
                </div>
                <div className="grid gap-2 p-3">
                  <AmountInput
                    value={shippingCost}
                    onChange={setShippingCost}
                  />
                </div>
                <div className="flex justify-between bg-sidebar border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsShippingPopoverOpen(false)}
                    disabled={isUpdatingShipping}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={updateShippingCost}
                    disabled={isUpdatingShipping}
                    variant={"defaultBlack"}
                  >
                    {isUpdatingShipping ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <CircleDashed className="h-4 w-4" /> Cambiar estado
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => updateProductsStatus("active")}
                disabled={hasProductsInReview || isProcessing}
              >
                <Eye className="h-4 w-4" />
                Publicar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateProductsStatus("draft")}
                disabled={hasProductsInReview || isProcessing}
              >
                <EyeOff className="h-4 w-4" />
                Borrador
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateProductsStatus("archived")}
                disabled={hasProductsInReview || isProcessing}
              >
                <Archive className="h-4 w-4" />
                Archivar
              </DropdownMenuItem>
              {allProductsDeleted && (
                <DropdownMenuItem
                  onClick={() => updateProductsStatus("draft")}
                  disabled={isProcessing}
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Restaurar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={hasProductsInReview || allProductsDeleted}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. {selectedProducts.length}{" "}
              producto
              {selectedProducts.length !== 1 ? "s" : ""} será
              {selectedProducts.length !== 1 ? "n" : ""} marcado
              {selectedProducts.length !== 1 ? "s" : ""} como eliminado
              {selectedProducts.length !== 1 ? "s" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteProducts();
              }}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Brand assignment dialog */}
      <Dialog open={showBrandDialog} onOpenChange={setShowBrandDialog}>
        <DialogContent className="p-0">
          <DialogHeader className="p-3 bg-sidebar border-b">
            <DialogTitle>Asignar marca</DialogTitle>
            <DialogDescription>
              Selecciona la marca que deseas asignar a los{" "}
              {selectedProducts.length} producto
              {selectedProducts.length !== 1 ? "s" : ""} seleccionado
              {selectedProducts.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-3">
            <div className="grid gap-2">
              <Label htmlFor="brand">Marca</Label>
              <SearchableSelect
                options={brands}
                value={selectedBrand}
                onValueChange={setSelectedBrand}
                placeholder="Selecciona una marca"
                emptyMessage="No se encontraron marcas"
                isLoading={isLoading}
                disabled={isProcessing}
                allowRequestNew={true}
                entityType="brand"
                businessId={businessId}
              />
            </div>
          </div>
          <DialogFooter className="p-3 border-t">
            <Button
              variant="outline"
              onClick={() => setShowBrandDialog(false)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={updateProductsBrand}
              disabled={!selectedBrand || isProcessing}
              variant={"defaultBlack"}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Asignar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category assignment dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="p-0">
          <DialogHeader className="p-3 border-b bg-sidebar">
            <DialogTitle>Asignar colección</DialogTitle>
            <DialogDescription>
              Selecciona la colección que deseas asignar a los{" "}
              {selectedProducts.length} producto
              {selectedProducts.length !== 1 ? "s" : ""} seleccionado
              {selectedProducts.length !== 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-3 bg-background">
            <CategoryTreeSelect
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
              isLoading={isLoading}
            />
          </div>
          <DialogFooter className="p-3 border-t bg-sidebar">
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={updateProductsCategory}
              disabled={!selectedCategory || isProcessing}
              variant={"defaultBlack"}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Asignar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
