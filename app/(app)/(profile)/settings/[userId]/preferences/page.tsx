import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { ThemeToggle } from "./_components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NotificationsPreferencesForm } from "./_components/preferences-form";
import { PageHeader } from "@/components/universal/headers";

const PreferencesPage = async ({ params }: { params: { userId: string } }) => {
  const supabase = createClient(cookies());

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.userId)
    .single();

  if (error || !user) {
    return null;
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <main className="h-fit w-full md:max-w-2xl px-5 md:px-0 py-5 pb-14 lg:py-7 mx-auto">
      <PageHeader
        title="Preferencias"
        description={`Puedes actualizar en cualquier momento tus preferencias de contacto.`}
      />
      <section className="w-full h-fit items-start justify-start flex flex-col gap-y-6">
        <NotificationsPreferencesForm preferences={preferences} user={user} />
      </section>
    </main>
  );
};

export default PreferencesPage;
