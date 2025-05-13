import { PageHeaderBackButton } from "@/components/universal/headers";
import FileUploadSection from "./_components/file-upload-section";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

interface Params {
  businessId: string;
}

interface Props {
  params: Params;
}

const ImportPage = async ({ params }: Props) => {
  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderBackButton
        title="Importar productos"
        description="Importa productos desde un archivo CSV o Excel."
      >
        <span>
          <Button
            variant="outline"
            asChild
            size="default"
            className="lg:flex hidden"
          >
            <Link href="/api/import/template">
              <Download className="h-4 w-4" /> Descargar plantilla
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            size="icon"
            className="flex lg:hidden"
          >
            <Link href="/api/import/template">
              <Download className="h-4 w-4" />
            </Link>
          </Button>
        </span>
      </PageHeaderBackButton>

      <div className="mt-6">
        <FileUploadSection businessId={params.businessId} />
      </div>
    </main>
  );
};

export default ImportPage;
