import createMDX from "@next/mdx";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Añadimos soporte para archivos MDX
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],

  // Mantenemos tu configuración de imágenes existente
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "www.elpalaciodehierro.com",
      },
    ],
  },
};

// Exportamos la configuración con soporte MDX
export default withMDX(nextConfig);
