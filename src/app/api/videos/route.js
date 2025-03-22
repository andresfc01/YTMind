import { NextResponse } from "next/server";
import { VideoRepository } from "@/lib/db/repositories";
import { extractVideoId } from "@/lib/utils/youtube";

/**
 * Endpoint para listar videos con filtros opcionales
 */
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const channelId = url.searchParams.get("channelId");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const sortBy = url.searchParams.get("sortBy") || "viewCount"; // viewCount, publishedAt
    const sortOrder = url.searchParams.get("sortOrder") || "desc"; // asc, desc

    // Preparar filtros
    const filter = {};
    if (channelId) filter.channelId = channelId;

    // Preparar opciones de ordenación
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Contar total de videos para la paginación
    const totalCount = await VideoRepository.count(filter);
    const totalPages = Math.ceil(totalCount / limit);

    // Obtener videos según los filtros y opciones
    const videos = await VideoRepository._verifyConnection().then(() =>
      VideoRepository.findAll(filter, {
        sort: sortOptions,
        limit,
        skip,
      })
    );

    return NextResponse.json({
      videos,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error al listar videos:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * POST /api/videos
 * Create or fetch a video from URL
 */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.url) {
      return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(data.url);

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube video URL" }, { status: 400 });
    }

    // Check if video already exists in database
    let video = await VideoRepository.findByYouTubeId(videoId);

    // If video doesn't exist, create it
    if (!video) {
      video = await VideoRepository.createFromYouTubeId(videoId);
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error creating/fetching video:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
