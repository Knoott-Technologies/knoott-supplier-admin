import { PageHeaderBackButton } from "@/components/universal/headers";
import FileUploadSection from "./_components/file-upload-section";

const ImportPage = ({ params }: { params: { businessId: string } }) => {
  return (
    <main className="h-fit w-full md:max-w-[95%] px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <PageHeaderBackButton
        title="Importar productos"
        description="Importa productos desde un archivo CSV o Excel."
      />

      <div className="mt-6">
        <FileUploadSection businessId={params.businessId} />
      </div>
    </main>
  );
};

export default ImportPage;
