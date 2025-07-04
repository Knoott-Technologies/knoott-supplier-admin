"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ChevronDown,
  X,
  ZoomIn,
  ZoomOut,
  SkipForward,
  AlertCircle,
  Edit,
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
  // Add these props to handle form state properly
  onValueChange?: (
    urls: string[],
    options?: { shouldDirty?: boolean; shouldValidate?: boolean }
  ) => void;
}

interface ImageToProcess {
  file?: File;
  url?: string; // For editing existing images
  preview: string;
  status: "pending" | "processing" | "complete" | "error";
  error?: string;
  isEdit?: boolean; // Flag to identify if this is an edit operation
  editIndex?: number; // Index of the image being edited
}

export function ImageUploadDropzone({
  value = [],
  onChange,
  onValueChange,
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
  const isMobile = useIsMobile();

  const currentImage = imagesToProcess[currentImageIndex];
  const remainingSlots = maxFiles - value.length;

  // Helper function to update form values with proper options
  const updateFormValue = (newUrls: string[], isEdit = false) => {
    if (onValueChange) {
      // Use onValueChange with proper options when available
      onValueChange(newUrls, {
        shouldDirty: !isEdit, // Don't mark as dirty when editing existing images
        shouldValidate: true,
      });
    } else {
      // Fallback to onChange
      onChange(newUrls);
    }
  };

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
        isEdit: false,
      }));

      if (newImagesToProcess.length > 0) {
        setImagesToProcess(newImagesToProcess);
        setCurrentImageIndex(0);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
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
      const fileName =
        currentImage.file?.name || `edited-image-${Date.now()}.jpg`;
      const fileType = currentImage.file?.type || "image/jpeg";
      const croppedFile = new File([croppedImageBlob], fileName, {
        type: fileType,
      });

      // Upload the cropped image
      const uploadedUrl = await uploadImage(croppedFile);

      // Update the form value with proper dirty state handling
      if (currentImage.isEdit && currentImage.editIndex !== undefined) {
        // Replace the existing image - don't mark as dirty since we're just replacing
        const newImages = [...value];
        const oldUrl = newImages[currentImage.editIndex];
        newImages[currentImage.editIndex] = uploadedUrl;
        updateFormValue(newImages, true); // true = isEdit
      } else {
        // Add new image - mark as dirty since it's a new addition
        updateFormValue([...value, uploadedUrl], false); // false = not edit
      }

      // Update status of current image
      setImagesToProcess((prev) => {
        const updated = [...prev];
        updated[currentImageIndex].status = "complete";
        return updated;
      });

      // Clean up current image
      if (currentImage.file) {
        URL.revokeObjectURL(currentImage.preview);
      }

      // Move to next image or close dialog
      if (currentImageIndex < imagesToProcess.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        // All images processed
        const actionText = currentImage.isEdit ? "editada" : "subida";
        const countText =
          imagesToProcess.length === 1
            ? `Se ha ${actionText} 1 imagen`
            : `Se han ${imagesToProcess.some((img) => img.isEdit) ? "editado" : "subido"} ${imagesToProcess.length} imágenes`;

        toast.success(`Imágenes ${actionText}s correctamente`, {
          description: `${countText} correctamente.`,
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

      toast.error("Error al procesar la imagen", {
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al procesar la imagen",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    updateFormValue(newImages, false); // Removing is considered a change, so mark as dirty
    toast("Imagen eliminada correctamente");
  };

  const handleEditImage = (index: number) => {
    const imageUrl = value[index];
    // Create an image to process for editing
    const imageToEdit: ImageToProcess = {
      url: imageUrl,
      preview: imageUrl, // Use the URL directly as preview
      status: "pending",
      isEdit: true,
      editIndex: index,
    };

    setImagesToProcess([imageToEdit]);
    setCurrentImageIndex(0);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropDialogOpen(true);

  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleCancelAll = () => {
    // Clean up all previews (only for new uploads, not edits)
    imagesToProcess.forEach((img) => {
      if (img.file && !img.isEdit) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImagesToProcess([]);
    setCurrentImageIndex(0);
    setCropDialogOpen(false);
  };

  const handleSkipImage = () => {
    // Clean up current image (only for new uploads, not edits)
    if (currentImage.file && !currentImage.isEdit) {
      URL.revokeObjectURL(currentImage.preview);
    }

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
                    updateFormValue([], false); // Mark as dirty since we're removing all images
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
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-7 bg-white/90 hover:bg-white"
                        onClick={() => handleEditImage(index)}
                        title="Editar imagen"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="size-7"
                        onClick={() => handleRemoveImage(index)}
                        title="Eliminar imagen"
                      >
                        <X className="h-3 w-3" />
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
          if (!open && imagesToProcess.length > 0) {
            // Confirm before closing if there are images to process
            const actionText = imagesToProcess.some((img) => img.isEdit)
              ? "edición"
              : "subida";
            if (
              confirm(
                `¿Estás seguro de que deseas cancelar la ${actionText} de imágenes?`
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
                {currentImage?.isEdit ? "Editar" : "Ajustar"} imagen{" "}
                {currentImageIndex + 1} de {imagesToProcess.length}
              </DialogTitle>
              <DialogDescription>
                {currentImage?.isEdit
                  ? "Edita y recorta la imagen existente para que tenga una relación de aspecto 3:4"
                  : "Ajusta la imagen para que tenga una relación de aspecto 3:4"}
              </DialogDescription>
            </div>
            {imagesToProcess.length > 1 && (
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
              {currentImage && (
                <Cropper
                  image={currentImage.preview}
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
                  type="button"
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
                  type="button"
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
                  {currentImage?.isEdit
                    ? "Guardando imagen editada..."
                    : "Subiendo imagen..."}
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
                Cancelar todo
              </Button>
              {!currentImage?.isEdit && (
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
              type="button"
              variant={"defaultBlack"}
              onClick={handleCropSave}
              disabled={isUploading}
            >
              {isUploading
                ? "Guardando..."
                : currentImage?.isEdit
                  ? "Guardar cambios"
                  : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
