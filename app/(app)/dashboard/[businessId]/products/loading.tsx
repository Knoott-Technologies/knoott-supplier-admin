import { PageHeader } from "@/components/universal/headers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <>
      <Skeleton className="h-14 w-full" />
      <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
        <PageHeader
          title="Productos"
          description="Gestiona tus productos, agrega, edita y elimina los productos de tu negocio"
        >
          <Button
            variant={"defaultBlack"}
            className="hidden lg:flex"
            size={"default"}
            disabled
          >
            Agregar Producto <Plus />
          </Button>
          <Button
            variant={"defaultBlack"}
            className="lg:hidden flex"
            size={"icon"}
            disabled
          >
            <Plus />
          </Button>
        </PageHeader>
        <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
          <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4">
            {/* Filter bar skeleton */}
            <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
              <Skeleton className="h-10 w-full md:w-64" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>

            {/* Table skeleton */}
            <div className="w-full border">
              {/* Table header */}
              <div className="flex items-center p-4 border-b bg-muted/40">
                <Skeleton className="h-4 w-16 mr-4" /> {/* Image column */}
                <Skeleton className="h-4 w-32 mr-auto" /> {/* Name column */}
                <Skeleton className="h-4 w-24 mx-4 hidden md:block" />{" "}
                {/* Description column */}
                <Skeleton className="h-4 w-20 mx-4" /> {/* Status column */}
                <Skeleton className="h-4 w-28 mx-4 hidden md:block" />{" "}
                {/* Date column */}
                <Skeleton className="h-4 w-24 mx-4 hidden md:block" />{" "}
                {/* Brand column */}
                <Skeleton className="h-4 w-24 mx-4 hidden md:block" />{" "}
                {/* Collection column */}
                <Skeleton className="h-4 w-8" /> {/* Actions column */}
              </div>

              {/* Table rows */}
              {Array(8)
                .fill(null)
                .map((_, index) => (
                  <div key={index} className="flex items-center p-4 border-b">
                    <Skeleton className="h-12 w-12 mr-4" />{" "}
                    {/* Product image */}
                    <div className="flex flex-col gap-1 mr-auto">
                      <Skeleton className="h-4 w-40" /> {/* Product name */}
                      <Skeleton className="h-3 w-24" />{" "}
                      {/* Product short description */}
                    </div>
                    <Skeleton className="h-6 w-16 mx-4 hidden md:block" />{" "}
                    {/* Description preview */}
                    <Skeleton className="h-6 w-16 mx-4" /> {/* Status badge */}
                    <Skeleton className="h-4 w-24 mx-4 hidden md:block" />{" "}
                    {/* Date */}
                    <Skeleton className="h-4 w-20 mx-4 hidden md:block" />{" "}
                    {/* Brand */}
                    <Skeleton className="h-4 w-20 mx-4 hidden md:block" />{" "}
                    {/* Collection */}
                    <Skeleton className="h-8 w-8" /> {/* Actions button */}
                  </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between w-full mt-4">
              <Skeleton className="h-8 w-24" /> {/* Items per page */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" /> {/* Previous page */}
                <Skeleton className="h-8 w-8" /> {/* Page number */}
                <Skeleton className="h-8 w-8" /> {/* Next page */}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
