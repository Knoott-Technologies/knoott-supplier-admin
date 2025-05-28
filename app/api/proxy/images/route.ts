import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("URL is required", { status: 400 });
  }

  try {
    // Descargar la imagen ignorando certificados SSL
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache por 24 horas
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new Response("Error loading image", { status: 500 });
  }
}
