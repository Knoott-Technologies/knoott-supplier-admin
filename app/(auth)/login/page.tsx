import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/universal/headers";
import { LoginTypesRenderer } from "./_components/login-types-renderer";

const LoginPage = () => {
  return (
    <main className="w-full h-fit items-center justify-center flex flex-col min-h-[calc(100dvh-56px)]">
      <div className="w-full h-fit items-start justify-start flex flex-col max-w-lg">
        <PageHeader
          title="Ingresa a tu cuenta"
          description="Inicia sesión en tu cuenta de Knoott Suppliers, para acceder a nuestros servicios."
        />
        <Card className="w-full">
          <CardContent className="bg-sidebar">
            <LoginTypesRenderer />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default LoginPage;
