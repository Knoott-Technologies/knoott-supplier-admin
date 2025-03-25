"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Download,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormValues, VariantsFormValues } from "@/lib/schemas";
import { Product } from "@/lib/product-schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ExtractedData {
  rawProduct: Product;
  product: ProductFormValues;
  variants: VariantsFormValues;
}

export function ProductCrawler() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [dataFormat, setDataFormat] = useState<"raw" | "transformed">(
    "transformed"
  );

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.error("Por favor ingresa una URL válida");
      return;
    }

    if (!url.includes("cimaco.com.mx")) {
      toast.error("La URL debe ser de cimaco.com.mx");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      toast.info(
        "Analizando la página con IA. Esto puede tomar unos momentos..."
      );

      const response = await fetch("/api/extract-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Error al extraer datos del producto"
        );
      }

      const data = await response.json();
      setExtractedData(data);
      toast.success("Información del producto extraída correctamente");
      setActiveTab("preview");
    } catch (err) {
      console.error("Error extracting product data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al extraer datos"
      );
      toast.error("Error al extraer datos del producto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!extractedData) return;

    const dataToDownload =
      dataFormat === "raw"
        ? extractedData.rawProduct
        : { product: extractedData.product, variants: extractedData.variants };

    const dataStr = JSON.stringify(dataToDownload, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `product-${extractedData.rawProduct.sku || "data"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Archivo JSON descargado");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado al portapapeles");

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getDisplayData = () => {
    if (!extractedData) return null;
    return dataFormat === "raw" ? extractedData.rawProduct : extractedData;
  };

  const displayData = getDisplayData();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-20"
          size={"icon"}
          variant="defaultBlack"
        >
          <Link />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit min-w-[200px] max-w-xl max-h-[80dvh] p-0 border-0" align="end">
        <Card>
          <CardHeader>
            <CardTitle>Extractor de Productos con IA</CardTitle>
            <CardDescription>
              Ingresa la URL de un producto de Cimaco para extraer su
              información utilizando inteligencia artificial y adaptarla a tu
              estructura de datos
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-sidebar flex flex-col gap-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="https://www.cimaco.com.mx/producto/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-background"
              />
              <Button
                onClick={handleExtract}
                disabled={isLoading}
                variant={"defaultBlack"}
                size={"icon"}
                className="whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>
            )}

            {extractedData && (
              <div>
                <Tabs
                  defaultValue="preview"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <div className="flex justify-between items-center">
                    <TabsList>
                      <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                      <TabsTrigger value="json">JSON</TabsTrigger>
                    </TabsList>

                    {activeTab === "json" && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Formato:
                        </span>
                        <TabsList>
                          <TabsTrigger
                            value="transformed"
                            onClick={() => setDataFormat("transformed")}
                            className={
                              dataFormat === "transformed"
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                          >
                            Transformado
                          </TabsTrigger>
                          <TabsTrigger
                            value="raw"
                            onClick={() => setDataFormat("raw")}
                            className={
                              dataFormat === "raw"
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                          >
                            Original
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    )}
                  </div>

                  <TabsContent
                    value="preview"
                    className="bg-background p-3 border"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Información Básica
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Nombre:</span>{" "}
                            {extractedData.rawProduct.name}
                          </div>
                          <div>
                            <span className="font-medium">Nombre corto:</span>{" "}
                            {extractedData.product.short_name}
                          </div>
                          <div>
                            <span className="font-medium">SKU:</span>{" "}
                            {extractedData.rawProduct.sku}
                          </div>
                          <div>
                            <span className="font-medium">Precio:</span> $
                            {extractedData.rawProduct.price.toFixed(2)}
                            {extractedData.rawProduct.original_price && (
                              <span className="ml-2 line-through text-muted-foreground">
                                $
                                {extractedData.rawProduct.original_price.toFixed(
                                  2
                                )}
                              </span>
                            )}
                          </div>
                          {extractedData.rawProduct.brand && (
                            <div>
                              <span className="font-medium">Marca:</span>{" "}
                              {extractedData.rawProduct.brand}
                            </div>
                          )}
                          {(extractedData.rawProduct.category ||
                            extractedData.rawProduct.subcategory) && (
                            <div>
                              <span className="font-medium">Categoría:</span>{" "}
                              {extractedData.rawProduct.category}
                              {extractedData.rawProduct.subcategory &&
                                ` > ${extractedData.rawProduct.subcategory}`}
                            </div>
                          )}
                          {extractedData.rawProduct.stock !== undefined && (
                            <div>
                              <span className="font-medium">Stock:</span>{" "}
                              {extractedData.rawProduct.stock > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800"
                                >
                                  Disponible{" "}
                                  {extractedData.rawProduct.stock > 1
                                    ? `(${extractedData.rawProduct.stock})`
                                    : ""}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-red-100 text-red-800"
                                >
                                  Agotado
                                </Badge>
                              )}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Extraído:</span>{" "}
                            {formatDate(extractedData.rawProduct.extracted_at)}
                          </div>
                        </div>

                        <Accordion type="single" collapsible className="mt-4">
                          <AccordionItem value="description">
                            <AccordionTrigger>Descripción</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                <div>
                                  <span className="font-medium">
                                    Descripción completa:
                                  </span>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                                    {extractedData.product.description ||
                                      "No hay descripción disponible"}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Descripción corta:
                                  </span>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {extractedData.product.short_description}
                                  </p>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          {extractedData.product.keywords &&
                            extractedData.product.keywords.length > 0 && (
                              <AccordionItem value="keywords">
                                <AccordionTrigger>
                                  Palabras clave
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-wrap gap-1">
                                    {extractedData.product.keywords.map(
                                      (keyword, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {keyword}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}

                          {extractedData.product.dimensions &&
                            extractedData.product.dimensions.length > 0 && (
                              <AccordionItem value="dimensions">
                                <AccordionTrigger>Dimensiones</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {extractedData.product.dimensions.map(
                                      (dim, idx) => (
                                        <div
                                          key={idx}
                                          className="grid grid-cols-2 gap-2 text-sm"
                                        >
                                          <div className="font-medium">
                                            {dim.label}:
                                          </div>
                                          <div>{dim.value}</div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}

                          {extractedData.product.specs &&
                            extractedData.product.specs.length > 0 && (
                              <AccordionItem value="specs">
                                <AccordionTrigger>
                                  Especificaciones
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {extractedData.product.specs.map(
                                      (spec, idx) => (
                                        <div
                                          key={idx}
                                          className="grid grid-cols-2 gap-2 text-sm"
                                        >
                                          <div className="font-medium">
                                            {spec.label}:
                                          </div>
                                          <div>{spec.value}</div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}

                          {extractedData.variants.variants &&
                            extractedData.variants.variants.length > 0 && (
                              <AccordionItem value="variants">
                                <AccordionTrigger>Variantes</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4">
                                    {extractedData.variants.variants.map(
                                      (variant, idx) => (
                                        <div key={idx}>
                                          <div className="font-medium mb-1">
                                            {variant.display_name}:
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {variant.options.map(
                                              (option, optIdx) => (
                                                <Badge
                                                  key={optIdx}
                                                  variant="secondary"
                                                  className={`text-xs ${
                                                    option.is_default
                                                      ? "border-primary"
                                                      : ""
                                                  }`}
                                                >
                                                  {option.display_name}
                                                  {option.is_default &&
                                                    " (predeterminado)"}
                                                </Badge>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}
                        </Accordion>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Imágenes ({extractedData.product.images_url.length})
                        </h3>
                        {extractedData.product.images_url.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {extractedData.product.images_url.map(
                              (img, idx) => (
                                <div key={idx} className="relative group">
                                  <img
                                    src={img || "/placeholder.svg"}
                                    alt={`Producto ${idx + 1}`}
                                    className="w-full h-32 object-cover rounded-md border"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => window.open(img, "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-4 border rounded-md text-muted-foreground">
                            No se encontraron imágenes
                          </div>
                        )}

                        <div className="mt-4">
                          <h3 className="text-lg font-medium mb-2">
                            URL Original
                          </h3>
                          <div className="flex items-center gap-2">
                            <Input
                              value={extractedData.rawProduct.url}
                              readOnly
                              className="text-xs"
                            />
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  extractedData.rawProduct.url,
                                  "_blank"
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="json">
                    <div className="relative">
                      <Textarea
                        value={JSON.stringify(displayData, null, 2)}
                        readOnly
                        className="font-mono text-xs h-[400px] resize-none"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(JSON.stringify(displayData, null, 2))
                        }
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
          {extractedData && (
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleDownloadJSON}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar JSON
              </Button>
            </CardFooter>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
