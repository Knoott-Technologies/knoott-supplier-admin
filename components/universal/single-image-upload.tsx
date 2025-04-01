"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  X,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  ImageIcon,
  Upload,
  ImagePlusIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Add custom styles for the cropper
const cropperStyles = {
  containerStyle: {
    backgroundColor: "white",
    width: "100%",
    height: "100%",
  },
  cropAreaStyle: {
    border: "1px solid #ffffff",
  },
  mediaStyle: {
    backgroundColor: "white", // Ensure the image background is white
  },
};

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  productId?: string;
  variantOptionId?: string;
}

export function SingleImageUpload({
  value = "",
  onChange,
  productId,
  variantOptionId,
}: SingleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToProcess, setImageToProcess] = useState<{
    file: File;
    preview: string;
  } | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) return;

    // Take only the first file
    const file = acceptedFiles[0];

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo excede el tamaño máximo de 5MB.");
      return;
    }

    setImageToProcess({
      file,
      preview: URL.createObjectURL(file),
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropDialogOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
  });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("No 2d context"));
          return;
        }

        // Set canvas dimensions to match the cropped image
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the cropped image onto the canvas
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas is empty"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.95
        );
      };

      image.onerror = () => {
        reject(new Error("Error loading image"));
      };
    });
  };

  const uploadImage = async (file: File | Blob): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append("file", file);

      // Add productId and variantOptionId if available
      if (productId) {
        formData.append("productId", productId);
      }

      if (variantOptionId) {
        formData.append("variantOptionId", variantOptionId);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      // Upload to your API
      const response = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error uploading image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
      // Reset progress after a short delay to show 100%
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleCropSave = async () => {
    if (!imageToProcess || !croppedAreaPixels) return;

    try {
      setIsUploading(true);

      // Get the cropped image as a blob
      const croppedImageBlob = await getCroppedImage(
        imageToProcess.preview,
        croppedAreaPixels
      );

      // Create a File from the Blob to preserve the filename
      const fileName = imageToProcess.file.name;
      const fileType = imageToProcess.file.type;
      const croppedFile = new File([croppedImageBlob], fileName, {
        type: fileType,
      });

      // Upload the cropped image
      const uploadedUrl = await uploadImage(croppedFile);

      // Update the form value
      onChange(uploadedUrl);

      // Clean up image preview
      URL.revokeObjectURL(imageToProcess.preview);
      setImageToProcess(null);
      setCropDialogOpen(false);

      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Error processing cropped image:", error);

      toast.error("Error al subir la imagen", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar la imagen",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    toast("Imagen eliminada correctamente");
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleCancelCrop = () => {
    // Clean up preview
    if (imageToProcess) {
      URL.revokeObjectURL(imageToProcess.preview);
    }
    setImageToProcess(null);
    setCropDialogOpen(false);
  };

  return (
    <>
      {value ? (
        <div className="relative group aspect-[3/4] max-w-[120px] min-w-[120px] h-auto shrink-0 bg-sidebar overflow-hidden border">
          <Image
            src={value || "/placeholder.svg"}
            alt="Imagen del producto"
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`aspect-[3/4] max-w-[120px] min-w-[120px] h-auto shrink-0 bg-sidebar flex flex-col items-center justify-center border border-dashed p-4 hover:bg-sidebar/50 cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/20"
          }`}
        >
          <input {...getInputProps()} />
          <ImagePlusIcon className="size-4 text-muted-foreground" />
        </div>
      )}

      <Dialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open && imageToProcess) {
            handleCancelCrop();
          }
          setCropDialogOpen(open);
        }}
      >
        <DialogContent className="p-0 max-w-xl [&>button]:hidden">
          <DialogHeader className="p-3 bg-background border-b">
            <DialogTitle>Ajustar imagen</DialogTitle>
            <DialogDescription>
              Ajusta la imagen para que tenga una relación de aspecto 3:4
            </DialogDescription>
          </DialogHeader>

          <div className="w-full h-fit bg-sidebar">
            <div className="relative h-auto aspect-video w-full bg-white p-3">
              {imageToProcess && (
                <Cropper
                  image={imageToProcess.preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  minZoom={0.5}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid
                  zoomWithScroll={isMobile ? true : false}
                  restrictPosition={false}
                  maxZoom={3}
                  objectFit="contain"
                  style={{
                    cropAreaStyle: cropperStyles.cropAreaStyle,
                    containerStyle: cropperStyles.containerStyle,
                    mediaStyle: cropperStyles.mediaStyle,
                  }}
                />
              )}
            </div>

            <div className="w-full flex flex-col gap-y-2 items-start justify-start p-3">
              <p className="text-sm font-semibold">Ajustes de zoom:</p>
              <div className="flex items-center justify-center gap-2 w-full">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5 || isUploading}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <div className="w-full flex-1">
                  <Slider
                    className="bg-foreground"
                    value={[zoom]}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onValueChange={(values) => setZoom(values[0])}
                    disabled={isUploading}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3 || isUploading}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="w-full px-3 pb-3">
                <p className="text-sm mb-1">Subiendo imagen...</p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row sm:justify-between bg-background gap-2 p-3 border-t">
            <Button
              variant="outline"
              onClick={handleCancelCrop}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              variant={"defaultBlack"}
              onClick={handleCropSave}
              disabled={isUploading}
            >
              {isUploading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
