import { NextResponse } from "next/server";
import { VideoRepository } from "@/lib/db/repositories";
import { getVideoDetails } from "@/lib/functions/getVideoDetails";

/**
 * Endpoint para obtener información de un video por su ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID del video" }, { status: 400 });
    }

    // Intentar obtener de la base de datos y actualizar si es necesario
    const videoDetails = await getVideoDetails({ videoId: id });

    if (!videoDetails) {
      return NextResponse.json({ error: "No se encontró el video con el ID proporcionado" }, { status: 404 });
    }

    return NextResponse.json({ video: videoDetails });
  } catch (error) {
    console.error("Error al obtener video:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
