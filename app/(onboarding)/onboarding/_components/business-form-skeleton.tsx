import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function BusinessFormSkeleton() {
  return (
    <div className="w-full space-y-5 lg:space-y-7">
      {/* Información general */}
      <Card className="w-full">
        <CardHeader className="bg-background">
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Ingresa la información general de tu negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-[250px]" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-4 w-[220px]" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[220px]" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-4 w-[250px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[170px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[220px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </CardContent>
      </Card>

      {/* Información bancaria */}
      <Card className="w-full">
        <CardHeader className="bg-background">
          <CardTitle>Información bancaria</CardTitle>
          <CardDescription>
            Ingresa la información bancaria de tu negocio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección del establecimiento */}
      <Card className="w-full">
        <CardHeader className="bg-background">
          <CardTitle>Dirección del establecimiento</CardTitle>
          <CardDescription>Ingresa la dirección de tu negocio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Zonas de entrega */}
      <Card className="w-full">
        <CardHeader className="bg-background">
          <CardTitle>Zonas de entrega</CardTitle>
          <CardDescription>
            Ingresa las zonas donde realizas entregas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-[300px] w-full rounded-md" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardContent>
      </Card>

      {/* Redes sociales */}
      <Card className="w-full">
        <CardHeader className="bg-background">
          <CardTitle>Redes sociales</CardTitle>
          <CardDescription>
            Ingresa tus nombres de usuario en las redes sociales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-sidebar">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-3">
            {/* Social media inputs */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-full flex">
                <Skeleton className="h-10 w-10 rounded-l-md" />
                <Skeleton className="h-10 flex-1 rounded-r-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Skeleton className="h-10 w-full md:w-[200px]" />
      </div>
    </div>
  );
}
