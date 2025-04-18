import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Ruta base para los archivos MDX
const contentDir = path.join(process.cwd(), "app", "(docs)", "_content");

// Interfaz para los metadatos de documentación
export interface DocMeta {
  title: string;
  description?: string;
  order?: number;
  published?: boolean;
}

// Interfaz para un documento
export interface Doc {
  slug: string[];
  content: string;
  meta: DocMeta;
}

// Interfaz para la estructura de navegación
export interface DocNavItem {
  title: string;
  slug: string[];
  order: number;
  children?: DocNavItem[];
}

// Función para leer un archivo MDX y extraer su contenido y metadatos
export async function getDocBySlug(slug: string[]): Promise<Doc | null> {
  try {
    // Construir la ruta del archivo
    let filePath: string;

    if (slug.length === 0) {
      filePath = path.join(contentDir, "index.mdx");
    } else {
      // Verificar si el último segmento es un archivo o una carpeta con index.mdx
      const possibleFilePath = path.join(contentDir, ...slug) + ".mdx";
      const possibleDirPath = path.join(contentDir, ...slug, "index.mdx");

      if (fs.existsSync(possibleFilePath)) {
        filePath = possibleFilePath;
      } else if (fs.existsSync(possibleDirPath)) {
        filePath = possibleDirPath;
      } else {
        return null;
      }
    }

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return null;
    }

    // Leer el archivo
    const source = fs.readFileSync(filePath, "utf8");

    // Extraer frontmatter y contenido usando gray-matter
    const { data, content } = matter(source);

    return {
      slug,
      content,
      meta: {
        title: data.title || slug[slug.length - 1] || "Documentación",
        description: data.description || "",
        order: data.order || 999,
        published: data.published !== false,
      },
    };
  } catch (error) {
    console.error("Error al cargar el documento:", error);
    return null;
  }
}

// Función para obtener todos los documentos para la navegación
export async function getAllDocs(): Promise<DocNavItem[]> {
  // Estructura para almacenar los elementos de navegación
  const result: DocNavItem[] = [];

  // Mapa para almacenar temporalmente los elementos por ruta
  const itemsMap: Record<string, DocNavItem> = {};

  // Función para obtener o crear un elemento padre
  function getOrCreateParent(segments: string[]): DocNavItem | null {
    if (segments.length === 0) return null;

    const parentKey = segments.join("/");

    if (!itemsMap[parentKey]) {
      // Intentar cargar el documento index.mdx para este directorio
      const indexPath = path.join(contentDir, ...segments, "index.mdx");

      if (fs.existsSync(indexPath)) {
        try {
          const source = fs.readFileSync(indexPath, "utf8");
          const { data } = matter(source);

          itemsMap[parentKey] = {
            title: data.title || segments[segments.length - 1],
            slug: segments,
            order: data.order || 999,
            children: [],
          };

          // Si tiene un padre, añadirlo como hijo
          if (segments.length > 1) {
            const parentSegments = segments.slice(0, -1);
            const parent = getOrCreateParent(parentSegments);

            if (parent && parent.children) {
              parent.children.push(itemsMap[parentKey]);
            }
          } else {
            // Es un elemento de nivel superior
            result.push(itemsMap[parentKey]);
          }
        } catch (error) {
          console.error("Error al cargar el índice:", error);
        }
      }
    }

    return itemsMap[parentKey] || null;
  }

  // Función para escanear un directorio
  function scanDirectory(dirPath: string, parentSegments: string[] = []) {
    const fullPath = path.join(contentDir, ...parentSegments, dirPath);

    if (!fs.existsSync(fullPath)) return;

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    // Primero procesar los directorios para crear la estructura
    entries
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        const segments = [...parentSegments, dirPath, entry.name].filter(
          Boolean
        );
        getOrCreateParent(segments);
        scanDirectory(entry.name, [...parentSegments, dirPath].filter(Boolean));
      });

    // Luego procesar los archivos MDX
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".mdx") &&
          entry.name !== "index.mdx"
      )
      .forEach((entry) => {
        const segments = [...parentSegments, dirPath].filter(Boolean);
        const filePath = path.join(fullPath, entry.name);

        try {
          const source = fs.readFileSync(filePath, "utf8");
          const { data } = matter(source);

          const fileItem: DocNavItem = {
            title: data.title || entry.name.replace(".mdx", ""),
            slug: [...segments, entry.name.replace(".mdx", "")],
            order: data.order || 999,
          };

          // Buscar el padre
          const parent = getOrCreateParent(segments);

          if (parent && parent.children) {
            parent.children.push(fileItem);
          } else if (segments.length === 0) {
            // Es un archivo en la raíz
            result.push(fileItem);
          }
        } catch (error) {
          console.error("Error al procesar archivo:", filePath, error);
        }
      });
  }

  // Procesar el archivo index.mdx en la raíz
  const rootIndexPath = path.join(contentDir, "index.mdx");
  if (fs.existsSync(rootIndexPath)) {
    try {
      const source = fs.readFileSync(rootIndexPath, "utf8");
      const { data } = matter(source);

      result.push({
        title: data.title || "Documentación",
        slug: [],
        order: data.order || 0,
      });
    } catch (error) {
      console.error("Error al cargar el índice raíz:", error);
    }
  }

  // Iniciar el escaneo desde la raíz
  scanDirectory("");

  // Función para ordenar recursivamente
  function sortItems(items: DocNavItem[]): DocNavItem[] {
    items.sort((a, b) => a.order - b.order);

    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.children = sortItems(item.children);
      }
    });

    return items;
  }

  return sortItems(result);
}
