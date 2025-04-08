import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NumberFlow from "@number-flow/react";

export const TotalProductsCard = ({ total }: { total: number | null }) => {
  return (
    <Card className="w-full flex-1 bg-sidebar">
      <CardHeader className="border-b-0 bg-transparent">
        <CardTitle>Productos</CardTitle>
        <CardDescription>
          Total de productos disponibles de tu negocio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-fit flex gap-x-2 items-baseline justify-start">
          <NumberFlow
            className="text-xl lg:text-3xl xl:text-4xl font-semibold truncate leading-none"
            value={total || 0}
          />
          {/* <span className="text-sm text-muted-foreground">/ {((total / allTotal) * 100).toFixed(2)}%</span> */}
        </div>
      </CardContent>
    </Card>
  );
};
