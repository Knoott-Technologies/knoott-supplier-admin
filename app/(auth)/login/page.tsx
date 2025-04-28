import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/universal/headers";
import { LoginTypesRenderer } from "./_components/login-types-renderer";
import { Suspense } from "react";

const LoginPage = ({
  searchParams,
}: {
  searchParams: { businessId?: string; token?: string; type?: string };
}) => {
  const businessId = searchParams.businessId || null;
  const token = searchParams.token || null;

  return (
    <main className="w-full h-fit items-center justify-center flex flex-col min-h-[calc(100dvh-56px)]">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-lg px-5 md:px-7 lg:px-0">
        <PageHeader
          title="Ingresa a tu cuenta"
          description="Inicia sesión en tu cuenta de Knoott Partners, para acceder a nuestros servicios."
        />
        <Card className="w-full">
          <CardContent className="bg-sidebar">
            <Suspense>
              <LoginTypesRenderer businessId={businessId} token={token} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
