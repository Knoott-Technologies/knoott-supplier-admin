import { PersonalInfoForm } from "./_components/personal-info-form";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DeleteAccountCard } from "./_components/delete-account-card";
import { PageHeader } from "@/components/universal/headers";

const ProfilePage = async ({ params }: { params: { userId: string } }) => {
  const supabase = createClient(cookies());

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.userId)
    .single();

  if (error || !user) {
    return null;
  }

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Mi perfil"
        description={`Configuraciones de tu cuenta.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <PersonalInfoForm user={user} />
        <DeleteAccountCard user={user} />
      </section>
    </main>
  );
};

export default ProfilePage;
