/**
 * Funciones para obtener y procesar transcripciones de videos de YouTube
 */

import { YoutubeTranscript } from "youtube-transcript";
import { formatVideoTranscription } from "../ai/gemini";

/**
 * Obtiene la transcripción de un video de YouTube
 * @param {string} videoId - ID del video de YouTube
 * @returns {Promise<string>} - Transcripción del video
 */
export async function getVideoTranscript(videoId) {
  try {
    console.log(`Obteniendo transcripción para el video ${videoId}...`);

    // Obtener la transcripción usando la librería youtube-transcript
    const transcriptSegments = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptSegments || transcriptSegments.length === 0) {
      console.warn(`No se encontró transcripción para el video ${videoId}`);
      return null;
    }

    // Unir todos los segmentos de la transcripción en un solo texto
    const rawTranscript = transcriptSegments.map((segment) => segment.text).join(" ");

    return rawTranscript;
  } catch (error) {
    console.error(`Error al obtener transcripción del video ${videoId}:`, error);
    return null;
  }
}

const TRANSFORM_TRANSCRIPT = false;

/**
 * Obtiene y formatea la transcripción de un video de YouTube
 * @param {string} videoId - ID del video de YouTube
 * @returns {Promise<string>} - Transcripción formateada del video
 */
export async function getFormattedVideoTranscript(videoId) {
  try {
    // Obtener la transcripción sin formato
    const rawTranscript = await getVideoTranscript(videoId);

    if (!rawTranscript) {
      return null;
    }

    // Si la transcripción es muy larga (más de 30000 caracteres), solo limpiar saltos de línea
    if (!TRANSFORM_TRANSCRIPT || rawTranscript.length > 30000) {
      console.log(
        `Transcripción para el video ${videoId} es muy larga (${rawTranscript.length} caracteres). Aplicando limpieza básica.`
      );
      // Reemplazar múltiples espacios y saltos de línea con un espacio
      return rawTranscript.replace(/\s+/g, " ").trim();
    }

    console.log(`Formateando transcripción para el video ${videoId}...`);

    // Formatear la transcripción usando Gemini
    const formattedTranscript = await formatVideoTranscription(rawTranscript);

    return formattedTranscript;
  } catch (error) {
    console.error(`Error al formatear transcripción del video ${videoId}:`, error);
    return null;
  }
}
