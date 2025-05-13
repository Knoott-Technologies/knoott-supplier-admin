"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProductsTableProps {
  products: any[];
  businessId: string;
  onUpdate: (updatedProducts: any[]) => void;
}

export default function ProductsTable({
  products,
  businessId,
  onUpdate,
}: ProductsTableProps) {
  const [editedProducts, setEditedProducts] = useState<any[]>(products);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(editedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, editedProducts.length);
  const currentItems = editedProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleDeleteProduct = (index: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      const updatedProducts = [...editedProducts];
      updatedProducts.splice(index, 1);
      setEditedProducts(updatedProducts);
      onUpdate(updatedProducts);
      toast.success("Producto eliminado");
    }
  };

  // Format price for display (convert from cents to dollars)
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Sin precio";
    return `$${(price / 100).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      <Alert variant="default" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Productos procesados con IA</AlertTitle>
        <AlertDescription>
          Estos productos han sido procesados automáticamente. Podrás editar
          todos los detalles una vez que los hayas guardado en tu catálogo.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Productos procesados ({editedProducts.length})
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Productos por página:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((product, index) => {
                const realIndex = startIndex + index;
                const variantOption = product.variants?.[0]?.options?.[0] || {};
                const brandName = product.brand_id ? "Con marca" : "Sin marca";
                const categoryName = product.subcategory_id
                  ? "Asignada"
                  : "Sin categoría";

                return (
                  <TableRow key={index} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {product.images_url &&
                          product.images_url.length > 0 &&
                          product.images_url[0] ? (
                            <img
                              src={product.images_url[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {product.short_description}
                          </p>
                          {product.images_url &&
                            product.images_url.length > 1 && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                +{product.images_url.length - 1} imágenes
                              </Badge>
                            )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.brand_id ? "default" : "outline"}>
                        {brandName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.subcategory_id ? "default" : "outline"}
                      >
                        {categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(variantOption.price)}</TableCell>
                    <TableCell>
                      {variantOption.stock ? variantOption.stock : "Sin stock"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteProduct(realIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {currentItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    No hay productos procesados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex justify-between items-center py-4 border-t">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1}-{endIndex} de {editedProducts.length}{" "}
              productos
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    <ChevronsLeft className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(totalPages)}>
                    <ChevronsRight className="h-4 w-4" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
