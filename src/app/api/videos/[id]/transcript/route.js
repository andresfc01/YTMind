import { NextResponse } from "next/server";
import { VideoRepository } from "@/lib/db/repositories";
import { getVideoDetails } from "@/lib/functions/getVideoDetails";

/**
 * Endpoint para obtener la transcripción de un video
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID del video" }, { status: 400 });
    }

    // Intentar obtener el video y su transcripción
    const videoDetails = await getVideoDetails({ videoId: id, includeTranscript: true });

    if (!videoDetails) {
      return NextResponse.json({ error: "No se encontró el video con el ID proporcionado" }, { status: 404 });
    }

    // Verificar si hay transcripción
    if (!videoDetails.transcription) {
      return NextResponse.json({ error: "No hay transcripción disponible para este video" }, { status: 404 });
    }

    // Devolver solo la transcripción
    return NextResponse.json({
      videoId: videoDetails.videoId,
      title: videoDetails.title,
      transcription: videoDetails.transcription,
    });
  } catch (error) {
    console.error("Error al obtener transcripción:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
