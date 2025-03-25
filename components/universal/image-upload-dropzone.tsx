"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ChevronDown, X, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from "../ui/carousel";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

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
    backgroundColor: "white", // Asegura que el fondo de la imagen sea blanco
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
}

export function ImageUploadDropzone({
  value = [],
  onChange,
  maxFiles = 10,
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
  const isMobile = useIsMobile();

  const currentImage = imagesToProcess[currentImageIndex];

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (value.length + acceptedFiles.length > maxFiles) {
        alert(`Solo puedes subir un máximo de ${maxFiles} imágenes.`);
        return;
      }

      // Prepare all files for processing
      const newImagesToProcess = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      if (newImagesToProcess.length > 0) {
        setImagesToProcess(newImagesToProcess);
        setCurrentImageIndex(0);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCropDialogOpen(true);
      }
    },
    [maxFiles, value.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: maxFiles - value.length,
  });

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = new window.Image();
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

      // Upload to your API
      const response = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropSave = async () => {
    if (!currentImage || !croppedAreaPixels) return;

    try {
      setIsUploading(true);

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

      // Clean up current image
      URL.revokeObjectURL(currentImage.preview);

      // Move to next image or close dialog
      if (currentImageIndex < imagesToProcess.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        // All images processed
        setImagesToProcess([]);
        setCurrentImageIndex(0);
        setCropDialogOpen(false);
      }
    } catch (error) {
      console.error("Error processing cropped image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...value];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const handleSkipImage = () => {
    if (!currentImage) return;

    // Clean up current image
    URL.revokeObjectURL(currentImage.preview);

    // Move to next image or close dialog
    if (currentImageIndex < imagesToProcess.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      // All images processed
      setImagesToProcess([]);
      setCurrentImageIndex(0);
      setCropDialogOpen(false);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleCancelAll = () => {
    // Clean up all previews
    imagesToProcess.forEach((img) => URL.revokeObjectURL(img.preview));
    setImagesToProcess([]);
    setCurrentImageIndex(0);
    setCropDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Collapsible
        defaultOpen={value.length <= 0}
        className="group/collapsible border"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant={"ghost"}
            className="w-full px-3 items-center justify-between bg-background"
          >
            <div className="flex flex-col gap-y-2">
              <h3>Agrega imágenes</h3>
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
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                Arrastra y suelta imágenes aquí, o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                Las imágenes deben tener una relación de aspecto 3:4
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {value.length > 0 && (
        <div className="w-full h-fit flex flex-col gap-y-4">
          <p>Imágenes seleccionadas</p>
          <Carousel>
            <CarouselContent className="-ml-2">
              {value.map((url, index) => (
                <CarouselItem
                  key={index}
                  className="basis-1/2 md:basis-1/3 lg:basis-1/4 pl-2"
                >
                  <div className="relative group aspect-[3/4] bg-background overflow-hidden">
                    <Image
                      src={url || "/placeholder.svg"}
                      alt={`Imagen del producto ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0 size-7"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
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
          </Carousel>
        </div>
      )}

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="p-0">
          <DialogHeader className="p-3 bg-background border-b">
            <DialogTitle>
              Ajustar imagen {currentImageIndex + 1} de {imagesToProcess.length}
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-fit bg-white">
            <div className="relative h-auto aspect-video w-full bg-white p-3">
              {currentImage && (
                <Cropper
                  image={currentImage.preview}
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
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <div className="w-full flex-1">
                  <Slider
                    value={[zoom]}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onValueChange={(values) => setZoom(values[0])}
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2 p-3 border-t">
            <div>
              <Button variant="outline" onClick={handleCancelAll}>
                Cancelar todo
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={"defaultBlack"}
                onClick={handleCropSave}
                disabled={isUploading}
              >
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
