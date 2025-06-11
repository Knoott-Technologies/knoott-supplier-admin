import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Database } from "@/database.types";
import { formatPrice } from "@/lib/utils";

export const ProductInfo = ({
  product,
}: {
  product: Database["public"]["Tables"]["products"]["Row"] & {
    brand: Database["public"]["Tables"]["catalog_brands"]["Row"];
    subcategory: Database["public"]["Tables"]["catalog_collections"]["Row"];
  };
}) => {
  return (
    <Card className="w-full flex flex-col h-fit">
      <CardHeader>
        <CardTitle>Información del producto</CardTitle>
        <CardDescription>
          Aquí podrás ver la información del producto
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full bg-sidebar flex-1 flex flex-col gap-y-4">
        <Card className="w-full bg-sidebar">
          <CardHeader className="bg-sidebar">
            <span className="gap-y-0">
              <p className="text-base font-semibold">Información general</p>
              <p className="text-sm text-muted-foreground">
                Información general del producto, como su nombre, descripción,
                etc.
              </p>
            </span>
          </CardHeader>
          <CardContent className="w-full h-fit grid grid-cols-1 xl:grid-cols-2 gap-4 bg-background">
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Nombre:</p>
              <p
                title={product.name}
                className="text-sm line-clamp-2 font-medium text-muted-foreground"
              >
                {product.name}
              </p>
            </span>
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Nombre Corto:</p>
              <p
                title={product.short_name}
                className="text-sm line-clamp-2 font-medium text-muted-foreground"
              >
                {product.short_name}
              </p>
            </span>
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Descripción:</p>
              <p
                title={product.description}
                className="text-sm line-clamp-6 font-medium text-muted-foreground"
              >
                {product.description}
              </p>
            </span>
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Descripción Corta:</p>
              <p
                title={product.short_description}
                className="text-sm line-clamp-6 font-medium text-muted-foreground"
              >
                {product.short_description}
              </p>
            </span>
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Costo de envío:</p>
              <p
                title={formatPrice(product.shipping_cost)}
                className="text-sm line-clamp-6 font-medium text-muted-foreground"
              >
                {formatPrice(product.shipping_cost)}
              </p>
            </span>
          </CardContent>
        </Card>
        <Card className="w-full bg-sidebar">
          <CardHeader className="bg-sidebar">
            <span className="gap-y-0">
              <p className="text-base font-semibold">Categorización</p>
              <p className="text-sm text-muted-foreground">
                Información de la categorización del producto, como su marca,
                colección, etc.
              </p>
            </span>
          </CardHeader>
          <CardContent className="w-full h-fit grid grid-cols-1 xl:grid-cols-2 gap-4 bg-background">
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Marca:</p>
              <p
                title={product.brand?.name || "Sin marca"}
                className="text-sm line-clamp-2 font-medium text-muted-foreground"
              >
                {product.brand?.name || "Sin marca"}
              </p>
            </span>
            <span className="w-full flex flex-col gap-y-1">
              <p className="text-sm font-semibold">Categoría:</p>
              {(product.subcategory && (
                <p
                  title={product.subcategory.name}
                  className="text-sm line-clamp-2 font-medium text-muted-foreground"
                >
                  {product.subcategory.name}
                </p>
              )) || (
                <div>
                  <Badge
                    variant={"secondary"}
                    className="bg-amber-100 text-yellow-600 hover:bg-amber-100 hover:text-yellow-600"
                  >
                    Acción necesaria
                  </Badge>
                </div>
              )}
            </span>
            <span className="w-full flex flex-col gap-y-1 xl:col-span-2">
              <p className="text-sm font-semibold">Palabras clave:</p>
              <span className="w-full flex flex-wrap gap-1">
                {product.keywords &&
                  product.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      className="font-medium border-border text-muted-foreground bg-sidebar hover:bg-sidebar/80"
                      variant={"outline"}
                    >
                      {keyword}
                    </Badge>
                  ))}
              </span>
            </span>
          </CardContent>
        </Card>
        {product.specs || product.dimensions ? (
          <Card className="w-full bg-sidebar">
            <CardHeader className="bg-sidebar">
              <span className="gap-y-0">
                <p className="text-base font-semibold">Especificaciones</p>
                <p className="text-sm text-muted-foreground">
                  Especificaciones del producto, como su tamaño, peso, etc.
                </p>
              </span>
            </CardHeader>
            <CardContent className="w-full h-fit flex flex-col gap-4 bg-background">
              {product.dimensions && (
                <span className="w-full flex flex-col gap-y-1">
                  <p className="text-sm font-semibold">Dimensiones:</p>
                  <div className="w-full overflow-hidden border">
                    <Table>
                      <TableBody>
                        {Object.entries(
                          product.dimensions as unknown as JSON
                        ).map(([key, value]) => (
                          <TableRow
                            key={key}
                            className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r grid grid-cols-[1fr_1.5fr]"
                          >
                            <TableCell className="bg-muted/50 py-2 font-medium">
                              {key}
                            </TableCell>
                            <TableCell className="py-2">{value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </span>
              )}
              {product.specs && (
                <span className="w-full flex flex-col gap-y-1">
                  <p className="text-sm font-semibold">Detalles:</p>
                  <div className="w-full overflow-hidden border">
                    <Table>
                      <TableBody>
                        {Object.entries(product.specs as unknown as JSON).map(
                          ([key, value]) => (
                            <TableRow
                              key={key}
                              className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r grid grid-cols-[1fr_1.5fr]"
                            >
                              <TableCell className="bg-muted/50 py-2 font-medium">
                                {key}
                              </TableCell>
                              <TableCell className="py-2">{value}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </span>
              )}
            </CardContent>
          </Card>
        ) : null}
      </CardContent>
    </Card>
  );
};
