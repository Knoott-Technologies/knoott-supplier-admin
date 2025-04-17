import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatPrice } from "@/lib/utils";

const PresetProducts = [
  {
    name: "Refrigerador Door Indoor",
    price: 3999900,
    status: "Activo",
  },
  {
    name: "Horno a gas hm6027gwai0",
    price: 680337,
    status: "Borrador",
  },
  {
    name: "Bose Bocina Portátil",
    price: 349900,
    status: "Activo",
  },
  {
    name: "Pantalla 85 pulgadas",
    price: 2699900,
    status: "Activo",
  },
  {
    name: "Laptop HP Pavilion",
    price: 1199900,
    status: "Activo",
  },
  {
    name: "Celular Samsung Galaxy S22",
    price: 849990,
    status: "Activo",
  },
  {
    name: "Mesa de Oficina",
    price: 499990,
    status: "Borrador",
  },
  {
    name: "Pantalones de Vestir",
    price: 499900,
    status: "Activo",
  },
];

export const CatalogSection2 = () => {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-sidebar group-hover:bg-contrast/5">
      {/* Main content */}
      <div className="flex w-full relative translate-x-[10%] min-w-[320px] lg:min-w-0 h-auto items-center justify-center bg-background border shadow-md group-hover:shadow-lg ease-in-out duration-300 z-10">
        <Table>
          <TableHeader>
            <TableRow className="divide-x">
              <TableHead className="!text-xs h-fit p-1.5">Nombre</TableHead>
              <TableHead className="!text-xs h-fit p-1.5">Precio</TableHead>
              <TableHead className="!text-xs h-fit p-1.5">Estatus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PresetProducts.map((product, index) => (
              <TableRow className="divide-x" key={index}>
                <TableCell className="!text-xs h-fit p-1.5 w-fit">
                  <p className="truncate">{product.name}</p>
                </TableCell>
                <TableCell className="!text-xs h-fit p-1.5 w-fit">
                  <p className="truncate">MXN {formatPrice(product.price)}</p>
                </TableCell>
                <TableCell className="!text-xs h-fit p-1.5 w-fit">
                  <Badge
                    className={cn(
                      "font-normal bg-success/10 hover:bg-success/10 text-success hover:text-success",
                      product.status === "Borrador" &&
                        "bg-primary/10 hover:bg-primary/10 text-amber-700 hover:text-amber-700"
                    )}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
