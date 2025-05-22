"use client";

import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { SelectValue } from "@/components/ui/select";

import { SelectTrigger } from "@/components/ui/select";

import { Select } from "@/components/ui/select";

import { useState, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
  type ColumnFiltersState,
  getFilteredRowModel,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  Trash2,
  ChevronDown,
  Search,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editedProducts, setEditedProducts] = useState<any[]>(products);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [brands, setBrands] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch brands and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch brands
        const { data: brandsData } = await supabase
          .from("catalog_brands")
          .select("id, name");

        if (brandsData) {
          const brandsMap: Record<string, string> = {};
          brandsData.forEach((brand: any) => {
            brandsMap[brand.id] = brand.name;
          });
          setBrands(brandsMap);
        }

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from("catalog_collections")
          .select("id, name");

        if (categoriesData) {
          const categoriesMap: Record<string, string> = {};
          categoriesData.forEach((category: any) => {
            categoriesMap[category.id] = category.name;
          });
          setCategories(categoriesMap);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // Format price for display (convert from cents to dollars)
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "Sin precio";
    return `$${(price / 100).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleDeleteSelected = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    if (selectedIndices.length === 0) return;

    const updatedProducts = editedProducts.filter(
      (_, index) => !selectedIndices.includes(index)
    );
    setEditedProducts(updatedProducts);
    onUpdate(updatedProducts);
    setRowSelection({});
    setShowDeleteDialog(false);
    toast.success(`${selectedIndices.length} producto(s) eliminado(s)`);
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Producto",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-3 max-w-[300px]">
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
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{product.name}</p>
              <p className="text-sm text-gray-500 line-clamp-1">
                {product.short_description}
              </p>
              {product.images_url && product.images_url.length > 1 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="mt-1 text-xs">
                        <ImageIcon className="h-3 w-3 mr-1" />
                        {product.images_url.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {product.images_url.length} imágenes disponibles
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "brand_id",
      header: "Marca",
      cell: ({ row }) => {
        const brandId = row.original.brand_id;
        const brandName = brandId
          ? brands[brandId] || "Cargando..."
          : "Sin marca";
        return (
          <Badge variant={brandId ? "secondary" : "outline"}>
            {isLoading ? "Cargando..." : brandName}
          </Badge>
        );
      },
    },
    {
      accessorKey: "subcategory_id",
      header: "Categoría",
      cell: ({ row }) => {
        const categoryId = row.original.subcategory_id;
        const categoryName = categoryId
          ? categories[categoryId] || "Cargando..."
          : "Sin categoría";
        return (
          <Badge variant={categoryId ? "secondary" : "outline"}>
            {isLoading ? "Cargando..." : categoryName}
          </Badge>
        );
      },
    },
    {
      id: "price",
      header: "Precio",
      cell: ({ row }) => {
        const variantOption = row.original.variants?.[0]?.options?.[0] || {};
        return formatPrice(variantOption.price);
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const variantOption = row.original.variants?.[0]?.options?.[0] || {};
        return variantOption.stock ? variantOption.stock : "Sin stock";
      },
    },
    {
      id: "shipping",
      header: "Envío",
      cell: ({ row }) => {
        return formatPrice(row.original.shipping_cost);
      },
    },
    {
      id: "sku",
      header: "SKU",
      cell: ({ row }) => {
        const variantOption = row.original.variants?.[0]?.options?.[0] || {};
        return variantOption.sku || "Sin SKU";
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const index = row.index;
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              const updatedProducts = [...editedProducts];
              updatedProducts.splice(index, 1);
              setEditedProducts(updatedProducts);
              onUpdate(updatedProducts);
              toast.success("Producto eliminado");
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: editedProducts,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-6">
      <Alert variant="default" className="mb-6 bg-tertiary/5 text-tertiary">
        <AlertCircle className="h-4 w-4 !text-tertiary" />
        <AlertTitle>Productos procesados con IA</AlertTitle>
        <AlertDescription>
          Estos productos han sido procesados automáticamente. Podrás editar
          todos los detalles una vez que los hayas guardado en tu catálogo.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            Productos procesados ({editedProducts.length})
          </h2>
          {Object.keys(rowSelection).length > 0 && (
            <Badge variant="outline" className="ml-2">
              {Object.keys(rowSelection).length} seleccionado(s)
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-8"
            />
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(rowSelection).length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar ({Object.keys(rowSelection).length})
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Columnas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === "price"
                          ? "Precio"
                          : column.id === "stock"
                            ? "Stock"
                            : column.id === "shipping"
                              ? "Envío"
                              : column.id === "sku"
                                ? "SKU"
                                : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No hay productos procesados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center py-4 border-t">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div>
                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                {table.getFilteredRowModel().rows.length} fila(s)
                seleccionada(s)
              </div>
            )}
          </div>
          <div className="flex items-center justify-end space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Filas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará {Object.keys(rowSelection).length}{" "}
              producto(s) de la lista de importación. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
