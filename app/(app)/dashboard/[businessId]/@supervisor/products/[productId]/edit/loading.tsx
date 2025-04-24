import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBackButton } from "@/components/universal/headers";

export default function NewProductLoading() {
  return (
    <main className="h-fit w-full mx-auto no-scrollbar">
      <div className="w-full max-w-5xl mx-auto px-3 md:px-0 pt-5 lg:pt-7">
        <PageHeaderBackButton
          title="Nuevo producto"
          description="Agrega un nuevo producto a tu catálogo."
        />
      </div>

      <div className="w-full max-w-5xl mx-auto px-3 md:px-0 py-6">
        <div className="bg-card border shadow-sm p-6">
          {/* Form header skeleton */}
          <div className="space-y-2 mb-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-8">
            {/* Basic info section */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 mb-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>

            {/* Image upload skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="border p-8 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <Skeleton className="h-12 w-12" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>

            {/* Categories and brands skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 mb-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Pricing skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 mb-2" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Inventory skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32 mb-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Form buttons skeleton */}
          <div className="mt-8 flex justify-end space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </main>
  );
}
