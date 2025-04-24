"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ExcelImportDialogProps {
  branchId: string;
}

export function ExcelImportDialog({ branchId }: ExcelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    created: number;
    updated: number;
    errors: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);

      // Intentar con la ruta principal
      let response = await fetch(`/api/products/template`, {
        method: "GET",
      });

      // Si falla, intentar con una ruta alternativa
      if (!response.ok) {
        console.warn("Fallback to alternative route");
        response = await fetch(`/api/template`, {
          method: "GET",
        });
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Verificar que el blob es realmente un archivo Excel
      if (
        blob.type !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        console.warn(
          "El tipo MIME no coincide con un archivo Excel:",
          blob.type
        );
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-productos.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Plantilla descargada", {
        description: "La plantilla se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Error al descargar", {
        description: "No se pudo descargar la plantilla. Inténtalo de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadExcel = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("branchId", branchId);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/products/import", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadResult({
            success: true,
            message: "Importación completada con éxito",
            created: response.created,
            updated: response.updated,
            errors: response.errors,
          });

          toast.success("Importación completada", {
            description: `Productos creados: ${response.created}, actualizados: ${response.updated}`,
          });
        } else {
          setUploadResult({
            success: false,
            message: "Error al procesar el archivo",
            created: 0,
            updated: 0,
            errors: 0,
          });

          toast.error("Error en la importación", {
            description: "No se pudo procesar el archivo Excel",
          });
        }
        setIsUploading(false);
        setFile(null);
      };

      xhr.onerror = () => {
        setUploadResult({
          success: false,
          message: "Error de conexión",
          created: 0,
          updated: 0,
          errors: 0,
        });
        setIsUploading(false);

        toast.error("Error de conexión", {
          description: "Hubo un problema al conectar con el servidor",
        });
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadResult({
        success: false,
        message: "Error al subir el archivo",
        created: 0,
        updated: 0,
        errors: 0,
      });
      setIsUploading(false);

      toast.error("Error", {
        description: "Ocurrió un error al subir el archivo",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Importar Excel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar productos desde Excel</DialogTitle>
          <DialogDescription>
            Sube un archivo Excel con la información de tus productos. Si el SKU
            ya existe, se actualizará el producto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={downloadTemplate}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Descargando...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Descargar plantilla</span>
              </>
            )}
          </Button>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              id="excel-file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label
              htmlFor="excel-file"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {file
                  ? file.name
                  : "Haz clic para seleccionar un archivo Excel"}
              </p>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Subiendo archivo...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {uploadResult && (
            <Alert variant={uploadResult.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {uploadResult.success ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                )}
                <div>
                  <AlertTitle>
                    {uploadResult.success ? "Éxito" : "Error"}
                  </AlertTitle>
                  <AlertDescription>
                    {uploadResult.message}
                    {uploadResult.success && (
                      <div className="mt-2 text-sm">
                        <p>Productos creados: {uploadResult.created}</p>
                        <p>Productos actualizados: {uploadResult.updated}</p>
                        {uploadResult.errors > 0 && (
                          <p>Errores: {uploadResult.errors}</p>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={uploadExcel}
            disabled={!file || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Importar productos</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
