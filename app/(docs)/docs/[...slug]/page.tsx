import { notFound } from "next/navigation";
import { serialize } from "next-mdx-remote/serialize";
import { MDXContent } from "../../_components/mdx-content";
import { getDocBySlug } from "../../_lib/docs-service";
import { PageHeader } from "@/components/universal/headers";

interface DocPageProps {
  params: {
    slug?: string[];
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const slug = params.slug || [];

  const doc = await getDocBySlug(slug);

  if (!doc) {
    console.error("Documento no encontrado para slug:", slug); // Añadir para depuración
    notFound();
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
