import { getAllDocs } from "../_lib/docs-service";
import DocsSidebar from "./docs-sidebar";
import type { User } from "@supabase/supabase-js";

export async function DocsSidebarWrapper({ user }: { user: User | null }) {
  // Cargar la estructura de documentación
  const docs = await getAllDocs();

  // Pasar los datos al componente cliente
  return <DocsSidebar user={user} docs={docs} />;
}
