import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BusinessInfoSkeleton() {
  return (
    <div className="w-full space-y-5 lg:space-y-7">
      {/* Sección: Información general */}
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Ingresa la información general de tu negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-[200px]" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-[120px] w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-[100px] w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Sección: Información bancaria */}
      <Card>
        <CardHeader>
          <CardTitle>Información bancaria</CardTitle>
          <CardDescription>
            Ingresa la información bancaria de tu negocio, a esta cuenta
            recibirás los pagos de Knoott.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección: Dirección del establecimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Dirección del establecimiento</CardTitle>
          <CardDescription>
            Ingresa la dirección de tu negocio, debe ser la dirección física
            donde estén tus oficinas, tienda, bodega, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Sección: Zonas de entrega */}
      <Card>
        <CardHeader>
          <CardTitle>Zonas de entrega</CardTitle>
          <CardDescription>
            Ingresa las zonas donde realizas entregas, mostraremos tu catálogo a
            los usuarios que reciban dentro de tu zona de entrega.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-[300px] w-full rounded-md" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </CardContent>
      </Card>

      {/* Sección: Redes sociales */}
      <Card>
        <CardHeader>
          <CardTitle>Redes sociales</CardTitle>
          <CardDescription>
            Ingresa tus nombres de usuario en las redes sociales que utilices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full flex">
                <Skeleton className="size-10 shrink-0 rounded-l-md" />
                <Skeleton className="h-10 flex-1 rounded-l-none" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
