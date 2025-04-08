"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DocumentUploadProps {
  value: string;
  onChange: (url: string) => void;
  maxSize?: number; // en MB
  accept?: string[];
  label?: string;
  onFileInfoChange?: (
    fileInfo: {
      name: string;
      type: string;
      size: number;
      url: string;
    } | null
  ) => void;
}

export function DocumentUpload({
  value,
  onChange,
  maxSize = 10,
  accept = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  label = "Documento",
  onFileInfoChange,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Verificar tamaño del archivo
    if (file.size > maxSize * 1024 * 1024) {
      setError(`El documento excede el tamaño máximo de ${maxSize}MB.`);
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    setFileSize(file.size);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Crear FormData
      const formData = new FormData();
      formData.append("file", file);

      // Enviar al servidor
      const response = await fetch("/api/upload-document", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al subir el documento");
      }

      const data = await response.json();
      onChange(data.url);

      // Si existe la función de callback para información del archivo, la llamamos
      if (onFileInfoChange) {
        onFileInfoChange({
          name: file.name,
          type: file.type,
          size: file.size,
          url: data.url,
        });
      }

      toast.success("Documento subido correctamente");
    } catch (error) {
      console.error("Error al subir el documento:", error);
      setError(
        error instanceof Error ? error.message : "Error al subir el documento"
      );
      toast.error("Error al subir el documento");
    } finally {
      setIsUploading(false);
      // Resetear progreso después de un breve retraso para mostrar 100%
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, curr) => {
      return { ...acc, [curr]: [] };
    }, {}),
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    onChange("");
    setFileName(null);
    setFileType(null);
    setFileSize(null);

    if (onFileInfoChange) {
      onFileInfoChange(null);
    }

    toast("Documento eliminado");
  };

  // Extraer nombre del archivo de la URL
  const getFileNameFromUrl = (url: string) => {
    if (!url) return null;
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const displayFileName = fileName || getFileNameFromUrl(value) || "Documento";

  // Formatear tamaño del archivo
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Obtener icono según tipo de archivo
  const getFileIcon = () => {
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!value ? (
        <div
          {...getRootProps()}
          className={`border rounded-md px-5 py-4 hover:bg-background/50 text-center bg-background cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/20"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Suelta el documento aquí"
                : `Arrastra y suelta un documento, o haz clic para seleccionar`}
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos aceptados:{" "}
              {accept
                .map((type) => {
                  switch (type) {
                    case "application/pdf":
                      return "PDF";
                    case "application/msword":
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                      return "Word";
                    case "application/vnd.ms-excel":
                    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                      return "Excel";
                    case "text/plain":
                      return "TXT";
                    default:
                      return type.split("/")[1];
                  }
                })
                .join(", ")}
            </p>
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: {maxSize}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md bg-background">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {displayFileName}
              </span>
              {fileSize && (
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(fileSize)}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploadProgress > 0 && (
        <div className="w-full">
          <p className="text-sm mb-1">Subiendo documento...</p>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
}
