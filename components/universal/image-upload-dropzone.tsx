"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ChevronDown,
  ZoomIn,
  ZoomOut,
  SkipForward,
  AlertCircle,
  Edit,
  Trash2,
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface ImageUploadDropzoneProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  productId?: string;
  variantOptionId?: string;
}

interface ImageToProcess {
  file: File;
  preview: string;
  status: "pending" | "processing" | "complete" | "error";
  error?: string;
}

interface EditingImage {
  url: string;
  index: number;
  preview: string;
}

export function ImageUploadDropzone({
  value = [],
  onChange,
  maxFiles = 20,
  productId,
  variantOptionId,
}: ImageUploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imagesToProcess, setImagesToProcess] = useState<ImageToProcess[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null);
  const isMobile = useIsMobile();

  const currentImage = imagesToProcess[currentImageIndex];
  const remainingSlots = maxFiles - value.length;
  const isEditMode = editingImage !== null;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (value.length + acceptedFiles.length > maxFiles) {
        setError(
          `Solo puedes subir un máximo de ${maxFiles} imágenes. Tienes ${remainingSlots} espacios disponibles.`
        );
        return;
      }

      // Check file sizes (limit to 5MB per file)
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > 5 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(
          `${oversizedFiles.length} ${
            oversizedFiles.length === 1 ? "archivo excede" : "archivos exceden"
          } el tamaño máximo de 5MB.`
        );
        return;
      }

      // Prepare all files for processing
      const newImagesToProcess = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));

      if (newImagesToProcess.length > 0) {
        setImagesToProcess(newImagesToProcess);
        setCurrentImageIndex(0);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setEditingImage(null);
        setCropDialogOpen(true);
      }
    },
    [maxFiles, value.length, remainingSlots]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: remainingSlots,
    disabled: remainingSlots <= 0,
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
    if (isEditMode) {
      // Handle editing existing image
      if (!editingImage || !croppedAreaPixels) return;

      try {
        setIsUploading(true);

        // Get the cropped image as a blob
        const croppedImageBlob = await getCroppedImage(
          editingImage.preview,
          croppedAreaPixels
        );

        // Create a File from the Blob
        const fileName = `edited-image-${Date.now()}.jpg`;
        const croppedFile = new File([croppedImageBlob], fileName, {
          type: "image/jpeg",
        });

        // Upload the cropped image
        const uploadedUrl = await uploadImage(croppedFile);

        // Replace the image in the array
        const newImages = [...value];
        newImages[editingImage.index] = uploadedUrl;
        onChange(newImages);

        // Clean up
        URL.revokeObjectURL(editingImage.preview);
        setEditingImage(null);
        setCropDialogOpen(false);

        toast.success("Imagen editada correctamente");
      } catch (error) {
        console.error("Error editing image:", error);
        toast.error("Error al editar la imagen", {
          description:
            error instanceof Error
              ? error.message
              : "Ocurrió un error al procesar la imagen",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      // Handle new image upload (existing logic)
      if (!currentImage || !croppedAreaPixels) return;

      try {
        setIsUploading(true);

        // Update status of current image
        setImagesToProcess((prev) => {
          const updated = [...prev];
          updated[currentImageIndex].status = "processing";
          return updated;
        });

        // Get the cropped image as a blob
        const croppedImageBlob = await getCroppedImage(
          currentImage.preview,
          croppedAreaPixels
        );

        // Create a File from the Blob to preserve the filename
        const fileName = currentImage.file.name;
        const fileType = currentImage.file.type;
        const croppedFile = new File([croppedImageBlob], fileName, {
          type: fileType,
        });

        // Upload the cropped image
        const uploadedUrl = await uploadImage(croppedFile);

        // Update the form value
        onChange([...value, uploadedUrl]);

        // Update status of current image
        setImagesToProcess((prev) => {
          const updated = [...prev];
          updated[currentImageIndex].status = "complete";
          return updated;
        });

        // Clean up current image
        URL.revokeObjectURL(currentImage.preview);

        // Move to next image or close dialog
        if (currentImageIndex < imagesToProcess.length - 1) {
          setCurrentImageIndex(currentImageIndex + 1);
          setCrop({ x: 0, y: 0 });
          setZoom(1);
        } else {
          // All images processed
          toast.success("Imágenes subidas correctamente", {
            description: `Se ${
              imagesToProcess.length === 1
                ? "ha subido 1 imagen"
                : `han subido ${imagesToProcess.length} imágenes`
            } correctamente.`,
          });
          setImagesToProcess([]);
          setCurrentImageIndex(0);
          setCropDialogOpen(false);
        }
      } catch (error) {
        console.error("Error processing cropped image:", error);

        // Update status of current image
        setImagesToProcess((prev) => {
          const updated = [...prev];
          updated[currentImageIndex].status = "error";
          updated[currentImageIndex].error =
            error instanceof Error ? error.message : "Error desconocido";
          return updated;
        });

        toast.error("Error al subir la imagen", {
          description:
            error instanceof Error
              ? error.message
              : "Ocurrió un error al procesar la imagen",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
    toast("Imagen eliminada correctamente");
  };

  const handleEditImage = (url: string, index: number) => {
    // Create a preview URL for the existing image
    const preview = url;

    setEditingImage({
      url,
      index,
      preview,
    });

    // Reset crop settings
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    // Open crop dialog
    setCropDialogOpen(true);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleCancelAll = () => {
    // Clean up all previews
    imagesToProcess.forEach((img) => URL.revokeObjectURL(img.preview));
    setImagesToProcess([]);
    setCurrentImageIndex(0);

    // Clean up editing image
    if (editingImage) {
      setEditingImage(null);
    }

    setCropDialogOpen(false);
  };

  const handleSkipImage = () => {
    if (isEditMode) {
      // Cancel editing
      if (editingImage) {
        URL.revokeObjectURL(editingImage.preview);
        setEditingImage(null);
      }
      setCropDialogOpen(false);
      return;
    }

    // Clean up current image
    URL.revokeObjectURL(currentImage.preview);

    // Remove the current image from the queue
    setImagesToProcess((prev) => {
      const updated = [...prev];
      updated.splice(currentImageIndex, 1);
      return updated;
    });

    // If we removed the last image, close the dialog
    if (imagesToProcess.length <= 1) {
      setCropDialogOpen(false);
      setImagesToProcess([]);
      setCurrentImageIndex(0);
    } else {
      // If we removed the last image in the array, go to the previous one
      if (currentImageIndex >= imagesToProcess.length - 1) {
        setCurrentImageIndex(imagesToProcess.length - 2);
      }
      // Otherwise, the index stays the same but points to the next image
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Collapsible
        defaultOpen={value.length <= 0}
        className="group/collapsible border rounded-md overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant={"ghost"}
            className="w-full px-3 items-center justify-between bg-background"
          >
            <div className="flex flex-col gap-y-2">
              <h3>
                Agrega imágenes ({value.length}/{maxFiles})
              </h3>
            </div>
            <ChevronDown className="shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:-rotate-180 size-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="w-full border-t overflow-hidden transition-all duration-300 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div
            {...getRootProps()}
            className={`px-5 py-7 hover:bg-background/50 text-center bg-background cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/20"
            } ${remainingSlots <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} disabled={remainingSlots <= 0} />
            <div className="flex flex-col items-center justify-center gap-2">
              {remainingSlots <= 0 ? (
                <p className="text-sm text-muted-foreground">
                  Has alcanzado el límite máximo de {maxFiles} imágenes
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta imágenes aquí, o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Las imágenes deben tener una relación de aspecto 3:4
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Puedes subir hasta {remainingSlots}{" "}
                    {remainingSlots === 1 ? "imagen más" : "imágenes más"} (máx.
                    5MB por imagen)
                  </p>
                </>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {value.length > 0 && (
        <div className="w-full h-fit flex flex-col gap-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">
              Imágenes seleccionadas ({value.length})
            </p>
            {value.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      "¿Estás seguro de que deseas eliminar todas las imágenes?"
                    )
                  ) {
                    onChange([]);
                    toast("Todas las imágenes han sido eliminadas");
                  }
                }}
              >
                Eliminar todas
              </Button>
            )}
          </div>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {value.map((url, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2"
                >
                  <div className="relative group aspect-[3/4] bg-background overflow-hidden rounded-md border">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Imagen del producto ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7 bg-white/90 hover:bg-white text-black"
                        onClick={() => handleEditImage(url, index)}
                        title="Editar imagen"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="size-7"
                        onClick={() => handleRemoveImage(index)}
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {value.length > 4 && (
              <div className="w-full h-fit items-center justify-center flex gap-x-1 mt-4">
                <CarouselPrevious
                  type="button"
                  variant={"defaultBlack"}
                  className="translate-y-0 static"
                />
                <CarouselNext
                  type="button"
                  variant={"defaultBlack"}
                  className="translate-y-0 static"
                />
              </div>
            )}
          </Carousel>
        </div>
      )}

      <Dialog
        open={cropDialogOpen}
        onOpenChange={(open) => {
          if (!open && (imagesToProcess.length > 0 || editingImage)) {
            // Confirm before closing if there are images to process
            if (
              confirm(
                isEditMode
                  ? "¿Estás seguro de que deseas cancelar la edición?"
                  : "¿Estás seguro de que deseas cancelar la subida de imágenes?"
              )
            ) {
              handleCancelAll();
            }
            return;
          }
          setCropDialogOpen(open);
        }}
      >
        <DialogContent className="p-0 max-w-xl [&>button]:hidden">
          <DialogHeader className="p-3 bg-background border-b flex flex-row justify-between items-start space-y-0">
            <div className="flex flex-col gap-0">
              <DialogTitle className="flex items-center justify-between">
                {isEditMode
                  ? "Editar imagen"
                  : `Ajustar imagen ${currentImageIndex + 1} de ${imagesToProcess.length}`}
              </DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Ajusta la imagen para que tenga una relación de aspecto 3:4"
                  : "Ajusta la imagen para que tenga una relación de aspecto 3:4"}
              </DialogDescription>
            </div>
            {!isEditMode && imagesToProcess.length > 1 && (
              <div className="flex items-center text-xs text-muted-foreground">
                <span>
                  {Math.round(
                    (currentImageIndex / imagesToProcess.length) * 100
                  )}
                  % completado
                </span>
              </div>
            )}
          </DialogHeader>

          <div className="w-full h-fit bg-sidebar">
            <div className="relative h-auto aspect-video w-full bg-white p-3">
              {(currentImage || editingImage) && (
                <Cropper
                  image={
                    isEditMode ? editingImage!.preview : currentImage.preview
                  }
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  minZoom={0.1}
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
                  disabled={zoom <= 0.1 || isUploading}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <div className="w-full flex-1">
                  <Slider
                    className="bg-foreground"
                    value={[zoom]}
                    min={0.1}
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
                <p className="text-sm mb-1">
                  {isEditMode ? "Guardando cambios..." : "Subiendo imagen..."}
                </p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row sm:justify-between bg-background gap-2 p-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelAll}
                disabled={isUploading}
              >
                {isEditMode ? "Cancelar" : "Cancelar todo"}
              </Button>
              {!isEditMode && (
                <Button
                  variant="outline"
                  onClick={handleSkipImage}
                  disabled={isUploading}
                  title="Omitir esta imagen"
                >
                  Omitir
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant={"defaultBlack"}
              onClick={handleCropSave}
              disabled={isUploading}
            >
              {isUploading
                ? isEditMode
                  ? "Guardando..."
                  : "Guardando..."
                : isEditMode
                  ? "Guardar cambios"
                  : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
