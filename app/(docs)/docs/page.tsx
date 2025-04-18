import { redirect } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import { MDXContent } from "../_components/mdx-content";
import { getDocBySlug } from "../_lib/docs-service";
import { PageHeader } from "@/components/universal/headers";

export default async function DocsIndexPage() {
  // Intentar cargar el documento index.mdx
  const doc = await getDocBySlug([]);

  if (!doc) {
    console.error("Documento index.mdx no encontrado");
    // Si no hay documento index, redirigir a otra página o mostrar un mensaje
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Documentación</h1>
        <p>
          Bienvenido a la documentación. Por favor, selecciona una sección del
          menú lateral.
        </p>
      </div>
    );
  }

  // Serializar el contenido MDX
  const mdxSource = await serialize(doc.content, {
    mdxOptions: {
      development: process.env.NODE_ENV === "development",
    },
  });

  return (
    <article className="h-fit w-full md:max-w-3xl px-3 md:px-0 py-5 pb-14 lg:py-7 mx-auto no-scrollbar">
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <MDXContent source={mdxSource} />
      </div>
    </article>
  );
}
