import { PageHeaderBackButton } from "@/components/universal/headers";
import { NewUserForm } from "./_components/new-user-form";

const NewUserPage = ({ params }: { params: { businessId: string } }) => {
  return (
    <main className="h-fit w-full md:max-w-3xl px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar z-0">
      <PageHeaderBackButton
        title="Nuevo usuario"
        description="Crea un nuevo usuario para tu negocio en Knoott Partners."
      />
      <NewUserForm businessId={params.businessId} />
    </main>
  );
};

export default NewUserPage;
