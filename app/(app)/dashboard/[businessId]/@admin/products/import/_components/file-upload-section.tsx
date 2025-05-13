"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDropzone } from "react-dropzone";
import DataPreview from "./data-preview";

export default function FileUploadSection({
  businessId,
}: {
  businessId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    const fileType = selectedFile.type;

    // Validate file type
    if (
      fileType !== "text/csv" &&
      fileType !== "application/vnd.ms-excel" &&
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      !selectedFile.name.endsWith(".csv") && // For cases where MIME type might not be detected correctly
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".xlsx")
    ) {
      toast.error("Por favor sube un archivo CSV o Excel");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Automatically process the file when dropped
    processFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxFiles: 1,
  });

  const processFile = async (fileToProcess: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", fileToProcess);
      formData.append("businessId", businessId);

      const response = await fetch("/api/import/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el archivo");
      }

      const data = await response.json();
      setFileData(data.data);
      toast.success("Archivo procesado correctamente");
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setError(err.message || "Error al procesar el archivo");
      toast.error("Error al procesar el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    if (
      fileType !== "text/csv" &&
      fileType !== "application/vnd.ms-excel" &&
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      !selectedFile.name.endsWith(".csv") && // For cases where MIME type might not be detected correctly
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".xlsx")
    ) {
      toast.error("Por favor sube un archivo CSV o Excel");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    await processFile(file);
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!fileData ? (
        <div className="w-full h-fit">
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-6 border-2 border-dashed transition-colors duration-200 ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} id="file-upload" />

            {isDragActive ? (
              <p className="text-sm text-primary font-medium mb-4">
                Suelta el archivo aquí...
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                Arrastra y suelta tu archivo CSV o Excel aquí, o haz clic para
                seleccionar
              </p>
            )}

            <Button
              variant="outline"
              className="cursor-pointer"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-upload")?.click();
              }}
            >
              Seleccionar archivo
            </Button>

            {file && (
              <div className="mt-4 text-sm">
                <p className="font-medium">Archivo seleccionado:</p>
                <p className="text-gray-500">{file.name}</p>
              </div>
            )}
          </div>

          {file && !isDragActive && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Procesar archivo
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <DataPreview data={fileData} businessId={businessId} />
      )}
    </div>
  );
}
