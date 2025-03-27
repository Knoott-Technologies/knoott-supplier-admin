"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, File, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface ShippingGuideUploadProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileUrl: string) => void;
}

export function ShippingGuideUpload({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: ShippingGuideUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Error", {
        description: "Por favor, selecciona un archivo para subir",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Crear la ruta del archivo en el bucket
      const filePath = `${orderId}/files/${file.name}`;

      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from("order-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Obtener la URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from("order-assets")
        .getPublicUrl(filePath);

      // Llamar a la función de éxito con la URL pública
      onSuccess(publicUrlData.publicUrl);

      toast.success("Archivo subido", {
        description: "La guía de envío se ha subido correctamente",
      });

      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      toast.error("Error", {
        description:
          "No se pudo subir el archivo. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Subir guía de envío</DialogTitle>
          <DialogDescription>
            Sube el archivo de la guía de envío para la orden #{orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              file ? "border-primary" : "border-border"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Haz clic para subir</span> o
                  arrastra y suelta
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, PNG, JPG o JPEG (máx. 10MB)
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2"
                >
                  Seleccionar archivo
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center space-x-2">
                  <File className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium truncate max-w-[300px]">
                    {file.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "Subiendo..." : "Subir y enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
