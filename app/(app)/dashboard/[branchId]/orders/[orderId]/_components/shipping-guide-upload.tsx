"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, File, Loader2, X, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ShippingETASelector } from "./shipping-eta-selector";

interface ShippingGuideUploadProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    fileUrl: string,
    etaFirst: Date | null,
    etaSecond: Date | null
  ) => void;
}

export function ShippingGuideUpload({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}: ShippingGuideUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [etaFirst, setEtaFirst] = useState<Date | null>(null);
  const [etaSecond, setEtaSecond] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
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

  const handleSelectETA = (first: Date, second: Date) => {
    setEtaFirst(first);
    setEtaSecond(second);
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

      // Llamar a la función de éxito con la URL pública y las fechas ETA
      onSuccess(publicUrlData.publicUrl, etaFirst, etaSecond);

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "[&>button]:hidden p-0 bg-sidebar",
          isMobile && "h-[80dvh] max-h-[80dvh]"
        )}
      >
        <div className="flex h-full w-full flex-col">
          <SheetHeader className="p-3 bg-sidebar border-b text-start space-y-0">
            <SheetTitle>Subir detalles de envío</SheetTitle>
            <SheetDescription>
              Agrega los detalles de envío de la orden #{orderId}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto bg-background p-3">
            <div className="flex flex-col gap-y-2">
              <span className="w-full flex flex-col">
                <p className="text-sm font-semibold">Guía de envío:</p>
                <p className="text-muted-foreground text-xs">
                  Adjunta una guía de envío de la orden
                </p>
              </span>
              <div
                className={`border border-dashed text-center ${
                  file ? "border-success bg-success/10" : "border-border"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col cursor-pointer bg-sidebar hover:bg-sidebar/80 items-center justify-center space-y-2 p-3 aspect-[16/6]"
                  >
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Haz clic para subir </span>{" "}
                      o arrastra y suelta
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
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <File className="size-4 text-success" />
                      <span className="text-sm text-success truncate max-w-[300px]">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="size-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>


            {/* Selector de tiempo estimado de entrega */}
            <div className="flex flex-col gap-y-2">
              <span className="w-full flex flex-col">
                <p className="text-sm font-semibold">
                  Tiempo estimado de entrega:
                </p>
                <p className="text-muted-foreground text-xs">
                  Define el rango de días hábiles para la entrega
                </p>
              </span>
              <ShippingETASelector onSelectETA={handleSelectETA} />
            </div>
          </div>
          <SheetFooter className="w-full bg-sidebar border-t p-3 pb-8 md:pb-3 gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              className="w-full"
              variant={"defaultBlack"}
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              {isUploading && <Loader2 className="animate-spin" />}
              {isUploading ? "Guardando..." : "Guardar"}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
