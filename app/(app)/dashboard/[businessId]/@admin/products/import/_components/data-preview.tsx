"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import ProductsTable from "./products-table";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icon } from "@/components/universal/logo";

interface DataPreviewProps {
  data: any[];
  businessId: string;
}

export default function DataPreview({ data, businessId }: DataPreviewProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processedData, setProcessedData] = useState<any[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingTime, setProcessingTime] = useState<number>(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentItems = data.slice(startIndex, endIndex);

  // Prevent navigation when processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing || isSaving) {
        // Standard way of showing a confirmation dialog
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue =
          "¿Estás seguro? El procesamiento está en curso y perderás todo el progreso.";
        return "¿Estás seguro? El procesamiento está en curso y perderás todo el progreso.";
      }
    };

    // Timer for processing time estimation
    let timer: NodeJS.Timeout;
    if (isProcessing) {
      timer = setInterval(() => {
        setProcessingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setProcessingTime(0);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timer) clearInterval(timer);
    };
  }, [isProcessing, isSaving]);

  const processDataWithAI = async () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessingTime(0);

    try {
      // Process each product one by one to show progress
      const processed = [];
      for (let i = 0; i < data.length; i++) {
        const response = await fetch("/api/import/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product: data[i],
            businessId,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al procesar los datos con IA");
        }

        const result = await response.json();
        processed.push(result.processedProduct);

        // Update progress
        setProgress(Math.round(((i + 1) / data.length) * 100));
      }

      setProcessedData(processed);
      toast.success("Datos procesados correctamente con IA");
    } catch (error) {
      console.error("Error processing data with AI:", error);
      toast.error("Error al procesar los datos con IA");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveProducts = async () => {
    if (!processedData) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/import/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: processedData,
          businessId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar los productos");
      }

      toast.success("Productos guardados correctamente");

      // Pequeña pausa para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      console.error("Error saving products:", error);
      toast.error(error.message || "Error al guardar los productos");
      setIsSaving(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Estimate remaining time based on progress and elapsed time
  const estimateRemainingTime = () => {
    if (progress <= 0 || processingTime <= 0) return "calculando...";

    const totalEstimatedTime = (processingTime / progress) * 100;
    const remainingTime = totalEstimatedTime - processingTime;

    if (remainingTime <= 0) return "finalizando...";

    const mins = Math.floor(remainingTime / 60);
    const secs = Math.floor(remainingTime % 60);

    if (mins > 0) {
      return `aprox. ${mins} min ${secs} seg`;
    } else {
      return `aprox. ${secs} segundos`;
    }
  };

  if (processedData) {
    return (
      <div className="w-full space-y-4">
        <ProductsTable
          products={processedData}
          businessId={businessId}
          onUpdate={(updatedProducts) => setProcessedData(updatedProducts)}
        />

        <div className="flex justify-end mt-6">
          <Button
            onClick={saveProducts}
            variant={"defaultBlack"}
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar productos
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vista previa de datos</CardTitle>
          <CardDescription>
            Esta es la vista previa de los datos del archivo que ingresaste
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-sidebar p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="divide-x">
                  {Object.keys(data[0] || {}).map((key) => (
                    <TableHead
                      className="w-fit max-w-[250px] min-w-[150px]"
                      key={key}
                    >
                      <p className="truncate">{key}</p>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((row, rowIndex) => (
                  <TableRow className="divide-x" key={rowIndex}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <TableCell
                        className="w-fit max-w-[250px] min-w-[150px]"
                        key={cellIndex}
                      >
                        <p className="truncate">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </p>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="w-full bg-background border-t p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                {!isProcessing && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Mostrando {startIndex + 1}-{endIndex} de {data.length}{" "}
                      filas
                    </span>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm text-gray-500">
                        Filas por página:
                      </span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={handleItemsPerPageChange}
                        disabled={isProcessing}
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
                )}

                {isProcessing && (
                  <div className="text-sm text-gray-500">
                    Procesando {data.length} productos...
                  </div>
                )}

                {!isProcessing && (
                  <Button
                    onClick={processDataWithAI}
                    className="flex items-center gap-2"
                    variant={"tertiary"}
                  >
                    Procesar con Knoott AI
                    <Icon variant={"white"} className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isProcessing && (
                <div className="mt-4">
                  <Alert className="mb-4 bg-tertiary/10">
                    <AlertTriangle className="h-4 w-4 !text-tertiary" />
                    <AlertTitle className="!text-tertiary">Procesamiento en curso</AlertTitle>
                    <AlertDescription className="!text-tertiary/80">
                      Este proceso puede tardar varios minutos dependiendo de la
                      cantidad de productos. Por favor, no cierres esta página
                      ni la recargues hasta que el proceso termine.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium">
                        Procesando productos con Knoott AI...
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Tiempo transcurrido: {formatTime(processingTime)} |
                        Tiempo restante: {estimateRemainingTime()}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5">
                    <div
                      className="bg-tertiary h-2.5"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center justify-center mt-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-tertiary mb-2" />
                    <p className="text-sm text-gray-600">
                      Estamos procesando tus productos con IA para adaptarlos a
                      tu catálogo.
                      <br />
                      Este proceso puede tardar unos minutos.
                    </p>
                  </div>
                </div>
              )}

              {!isProcessing && totalPages > 1 && (
                <Pagination className="mx-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(1)}
                      >
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
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
                        }
                      >
                        <ChevronRight className="h-4 w-4" />
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
