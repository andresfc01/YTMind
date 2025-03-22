/**
 * Función para obtener detalles de un video y guardarlos en la base de datos
 */

import { fetchVideoDetails } from "../youtube/api";
import { getFormattedVideoTranscript } from "../youtube/transcript";
import VideoRepository from "../db/repositories/VideoRepository";

/**
 * Obtiene los detalles de un video y los guarda en la base de datos
 * @param {Object} params - Parámetros para la función
 * @param {string} params.videoId - ID del video de YouTube
 * @param {boolean} params.includeTranscript - Si se debe incluir la transcripción en la respuesta (default: false)
 * @returns {Promise<Object>} - Detalles del video
 */
export async function getVideoDetails({ videoId, includeTranscript = false }) {
  try {
    // Primero verificar si ya tenemos el video en la base de datos
    let existingVideo = null;
    try {
      existingVideo = await VideoRepository.findByVideoId(videoId);

      // Si el video existe, fue analizado hace menos de 24 horas y ya tiene transcripción (si se solicita)
      if (existingVideo && existingVideo.analyzedAt) {
        const hoursAgo = (Date.now() - existingVideo.analyzedAt.getTime()) / (1000 * 60 * 60);

        // Si ha pasado menos de una semana, usar los datos en caché
        if (hoursAgo < 24 * 7) {
          console.log(`Usando datos en caché para el video ${videoId}`);

          // Si no se requiere la transcripción, eliminarla del objeto antes de devolverlo
          if (!includeTranscript && existingVideo.transcription) {
            const { transcription, ...videoWithoutTranscription } = existingVideo.toObject();
            return videoWithoutTranscription;
          }

          return existingVideo;
        }
      }
    } catch (dbError) {
      console.warn("Error al buscar video en la base de datos:", dbError);
      // Continuar para obtener los datos de la API
    }

    // Si no está en la base de datos o está desactualizado, obtener de la API
    console.log(`Obteniendo datos del video ${videoId} desde la API de YouTube...`);
    const videoDetails = await fetchVideoDetails(videoId);

    // Preparar datos para guardar
    const videoData = {
      videoId: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.description,
      channelId: videoDetails.channelId,
      channelTitle: videoDetails.channelTitle,
      publishedAt: videoDetails.publishedAt,
      statistics: videoDetails.statistics,
      metadata: videoDetails.metadata,
      analyzedAt: new Date(),
    };

    // Si el video ya existía, mantener la transcripción anterior si existe
    if (existingVideo && existingVideo.transcription) {
      videoData.transcription = existingVideo.transcription;
    }

    // Intentar obtener la transcripción SOLO si nunca se ha intentado antes
    // (es decir, si no hay transcripción en el existingVideo)
    if (!videoData.transcription && (!existingVideo || !existingVideo.hasOwnProperty("transcription"))) {
      try {
        console.log(`Obteniendo transcripción para el video ${videoId}...`);
        const formattedTranscript = await getFormattedVideoTranscript(videoId);

        if (formattedTranscript) {
          videoData.transcription = formattedTranscript;
          console.log(`Transcripción obtenida para el video ${videoId}`);
        } else {
          console.warn(`No se pudo obtener transcripción para el video ${videoId}`);
          // Guardar un valor vacío para indicar que ya intentamos obtener la transcripción
          videoData.transcription = "";
        }
      } catch (transcriptError) {
        console.error(`Error al obtener transcripción para el video ${videoId}:`, transcriptError);
        // Guardar un valor vacío para indicar que ya intentamos obtener la transcripción
        videoData.transcription = "";
      }
    }

    // Guardar en la base de datos
    try {
      const savedVideo = await VideoRepository.updateByVideoId(videoId, videoData);
      console.log(`Video ${videoId} guardado/actualizado en la base de datos`);

      // Si no se requiere la transcripción, eliminarla del objeto antes de devolverlo
      if (!includeTranscript && savedVideo.transcription) {
        const { transcription, ...videoWithoutTranscription } = savedVideo.toObject();
        return videoWithoutTranscription;
      }

      return savedVideo;
    } catch (saveError) {
      console.error("Error al guardar video en la base de datos:", saveError);
      // Devolver los datos aunque no se hayan guardado

      // Si no se requiere la transcripción, eliminarla del objeto antes de devolverlo
      if (!includeTranscript && videoData.transcription) {
        const { transcription, ...videoWithoutTranscription } = videoData;
        return videoWithoutTranscription;
      }

      return videoData;
    }
  } catch (error) {
    console.error("Error en getVideoDetails:", error);
    throw new Error(`Error al obtener detalles del video: ${error.message}`);
  }
}
