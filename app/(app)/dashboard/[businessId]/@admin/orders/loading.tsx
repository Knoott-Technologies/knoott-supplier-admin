import { PageHeader } from "@/components/universal/headers";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <>
      <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar z-0">
        <PageHeader
          title="Órdenes"
          description="Visualiza y administra las órdenes de tus clientes."
        />

        <section className="w-full h-fit items-start justify-start flex flex-col gap-y-5 lg:gap-y-7">
          {/* Summary Cards Skeleton */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Orders Card */}
            <div className="border rounded-lg p-4 bg-card">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-56 mb-6" />
              <Skeleton className="h-12 w-12 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Require Attention Card */}
            <div className="border rounded-lg p-4 bg-card">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-5 w-5" />
              </div>
              <Skeleton className="h-4 w-56 mb-6" />
              <Skeleton className="h-12 w-12 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Order Status Card */}
            <div className="border rounded-lg p-4 bg-card">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-56 mb-4" />

              {/* Status items */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-6" />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-fit items-start justify-start flex flex-col gap-y-4">
            {/* Filter bar skeleton */}
            <div className="w-full flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Orders sections skeleton */}
            {[1, 2].map((section) => (
              <div key={section} className="w-full mb-6">
                {/* Section header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-3 mr-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-5 w-5" />
                  </div>
                </div>

                {/* Orders table */}
                <div className="w-full border">
                  {/* Table header */}
                  <div className="flex items-center p-4 border-b bg-muted/40">
                    <Skeleton className="h-4 w-8 mr-4" /> {/* View column */}
                    <Skeleton className="h-4 w-16 mr-4" /> {/* ID column */}
                    <Skeleton className="h-4 w-24 mr-4" /> {/* Status column */}
                    <Skeleton className="h-4 w-32 mr-4" /> {/* Date column */}
                    <Skeleton className="h-4 w-40 mr-4" /> {/* Client column */}
                    <Skeleton className="h-4 w-64 mr-4" />{" "}
                    {/* Address column */}
                  </div>

                  {/* Table rows */}
                  {Array(section === 1 ? 1 : 3)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 border-b"
                      >
                        <Skeleton className="h-8 w-8 mr-4" />{" "}
                        {/* View button */}
                        <Skeleton className="h-4 w-12 mr-4" /> {/* Order ID */}
                        <Skeleton className="h-6 w-32 mr-4" />{" "}
                        {/* Status badge */}
                        <Skeleton className="h-4 w-32 mr-4" /> {/* Date */}
                        <Skeleton className="h-4 w-40 mr-4" />{" "}
                        {/* Client name */}
                        <Skeleton className="h-4 w-64" /> {/* Address */}
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {/* Pagination skeleton */}
            <div className="flex items-center justify-between w-full mt-4">
              <Skeleton className="h-8 w-24" /> {/* Items per page */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8" />{" "}
                {/* Previous page */}
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
