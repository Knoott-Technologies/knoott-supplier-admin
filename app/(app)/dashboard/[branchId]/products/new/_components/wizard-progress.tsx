"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface Step {
  name: string;
  path: string;
}

export function WizardProgress({
  branchId,
  currentProductId,
}: {
  branchId: string;
  currentProductId?: string;
}) {
  const pathname = usePathname();

  const steps: Step[] = [
    {
      name: "Información general",
      path: `/dashboard/${branchId}/products/new/general-info`,
    },
    { name: "Imágenes", path: `/dashboard/${branchId}/products/new/images` },
    {
      name: "Categorización",
      path: `/dashboard/${branchId}/products/new/categorization`,
    },
    {
      name: "Especificaciones",
      path: `/dashboard/${branchId}/products/new/specifications`,
    },
    { name: "Variantes", path: `/dashboard/${branchId}/products/new/variants` },
  ];

  // If we have a product ID, update the paths to include it
  if (currentProductId) {
    steps.forEach((step) => {
      step.path = step.path.replace("/new/", `/edit/${currentProductId}/`);
    });
  }

  const currentStepIndex = steps.findIndex((step) =>
    pathname.includes(step.path.split("/").pop()!)
  );

  const nextStep = steps[currentStepIndex + 1];

  return (
    <div className="mb-4 w-full">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">
            Paso {currentStepIndex + 1} de {steps.length}
          </p>
          <h2 className="text-base">
            {steps[currentStepIndex]?.name}
          </h2>
        </div>

        {nextStep && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Siguiente</p>
            <p className="font-medium flex items-center">
              {nextStep.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
