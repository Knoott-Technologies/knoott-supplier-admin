import { PageHeaderBackButton } from "@/components/universal/headers";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ApiIntegrationLoading() {
  return (
    <main className="h-fit w-full md:max-w-2xl px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderBackButton
        title="Integración de API"
        description="Configura la integración con APIs externas para sincronizar productos automáticamente"
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Integración con API</CardTitle>
          <CardDescription>
            Conecta tu tienda con un proveedor externo para sincronizar
            productos automáticamente. Puedes configurar claves y parámetros
            personalizados.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-y-4 bg-sidebar">
          {/* Proveedor de integración */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          {/* URL base de la API */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          {/* Clave API / Token de acceso */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="relative">
              <Skeleton className="h-10 w-full" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          {/* Parámetros adicionales */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 justify-end border-t p-4">
          <Skeleton className="h-9 w-32" /> {/* Probar conexión */}
          <Skeleton className="h-9 w-40" /> {/* Guardar configuración */}
        </CardFooter>
      </Card>
    </main>
  );
}
