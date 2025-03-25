import type React from "react";
import { PageHeaderBackButton } from "@/components/universal/headers";

export default function ProductWizardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { branchId: string };
}) {
  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <section className="max-w-2xl mx-auto">
        <PageHeaderBackButton
          title="Nuevo producto"
          description="Agrega un nuevo producto a tu catálogo."
        />
        {children}
      </section>
    </main>
  );
}
