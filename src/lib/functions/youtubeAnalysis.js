/**
 * Funciones de análisis de YouTube para los agentes
 */

import { fetchChannelInfo, fetchChannelVideos, fetchVideoDetails } from "../youtube/api";
import ChannelRepository from "../db/repositories/ChannelRepository";
import VideoRepository from "../db/repositories/VideoRepository";
import { getFormattedVideoTranscript } from "../youtube/transcript";

/**
 * Obtiene y analiza información de un canal de YouTube
 * @param {Object} params - Parámetros para la función
 * @param {string} params.channelIdentifier - ID o username del canal
 * @param {boolean} params.fetchPopularVideos - Si debe obtener los videos populares (por defecto false)
 * @returns {Promise<Object>} - Información y análisis del canal
 */
export async function getChannelInfo({ channelIdentifier, fetchPopularVideos = false }) {
  try {
    // Obtener información básica del canal
    const channelInfo = await fetchChannelInfo(channelIdentifier);

    // Calcular métricas adicionales
    const avgViewsPerVideo = Math.round(channelInfo.statistics.viewCount / channelInfo.statistics.videoCount);
    const engagementRate = Math.round(
      (channelInfo.statistics.subscriberCount / channelInfo.statistics.viewCount) * 100
    );

    // Añadir métricas calculadas
    const result = {
      ...channelInfo,
      analysis: {
        ...channelInfo.analysis,
        metrics: {
          avgViewsPerVideo,
          engagementRate,
        },
      },
    };

    // Si se solicita, obtener videos populares (pero solo si no es una llamada recursiva)
    if (fetchPopularVideos) {
      // Aquí hay que tener cuidado para evitar llamadas circulares
      // Solo obtendremos videos populares directamente, sin usar listChannelVideos
      // porque listChannelVideos ya llama a getChannelInfo

      // Construimos la URL para obtener los videos más populares
      const maxResults = 50;
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelInfo.channelId}&type=video&order=viewCount&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en la API de YouTube: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // Obtener detalles de los videos
      const videoIds = data.items.map((item) => item.id.videoId).join(",");
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`;

      const detailsResponse = await fetch(detailsUrl);
      if (!detailsResponse.ok) {
        const errorData = await detailsResponse.json();
        throw new Error(`Error en la API de YouTube: ${errorData.error?.message || detailsResponse.statusText}`);
      }

      const detailsData = await detailsResponse.json();

      // Filtrar Shorts
      const filteredVideos = detailsData.items.filter((video) => !isYoutubeShort(video));

      // Extraer la información relevante y ordenar por vistas
      const popularVideos = filteredVideos
        .map((video) => ({
          videoId: video.id,
          title: video.snippet.title,
          publishedAt: new Date(video.snippet.publishedAt),
          thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
          viewCount: parseInt(video.statistics.viewCount, 10),
          likeCount: parseInt(video.statistics.likeCount || 0, 10),
          commentCount: parseInt(video.statistics.commentCount || 0, 10),
          duration: video.contentDetails?.duration,
        }))
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 10); // Tomar solo los 10 más populares

      // Añadir los videos populares al resultado
      result.analysis.popularVideos = popularVideos;
    } else {
      // Calcular frecuencia de publicación si no tenemos los videos populares
      // Obtenemos algunos videos recientes solo para calcular frecuencia
      const recentVideos = await fetchChannelVideos(channelInfo.channelId, { maxResults: 10 });

      if (recentVideos.length >= 2) {
        const dates = recentVideos.map((video) => new Date(video.publishedAt));
        const timeDiffs = [];
        for (let i = 1; i < dates.length; i++) {
          timeDiffs.push(dates[i - 1].getTime() - dates[i].getTime());
        }
        const avgTimeBetweenVideos = Math.round(timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length);
        const daysPerVideo = Math.round(avgTimeBetweenVideos / (1000 * 60 * 60 * 24));
        result.analysis.publicationFrequency = {
          daysPerVideo,
          videosPerMonth: Math.round(30 / daysPerVideo),
        };
      }
    }

    return result;
  } catch (error) {
    console.error("Error en getChannelInfo:", error);
    throw new Error(`Error al analizar el canal: ${error.message}`);
  }
}

/**
 * Determina si un video es un Short de YouTube
 * @param {Object} video - Datos del video
 * @returns {boolean} - true si es un Short, false si no
 */
function isYoutubeShort(video) {
  // Criterio 1: Verifica si tiene #shorts en el título o descripción
  const hasShortTag =
    (video.snippet.title && video.snippet.title.toLowerCase().includes("#short")) ||
    (video.snippet.description && video.snippet.description.toLowerCase().includes("#short"));

  // Criterio 2: Verifica la duración (los Shorts suelen durar menos de 60 segundos)
  // La duración viene en formato ISO 8601: PT1M30S (1 minuto 30 segundos)
  let isShortDuration = false;
  if (video.contentDetails && video.contentDetails.duration) {
    const durationMatch = video.contentDetails.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || 0);
      const minutes = parseInt(durationMatch[2] || 0);
      const seconds = parseInt(durationMatch[3] || 0);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      isShortDuration = totalSeconds <= 60;
    }
  }

  return hasShortTag || isShortDuration;
}

/**
 * Guarda o actualiza la información del canal en la base de datos
 * @param {Object} channelInfo - Información del canal obtenida de getChannelInfo
 * @returns {Promise<Object>} - Canal guardado en la base de datos
 */
async function saveChannelToDatabase(channelInfo) {
  try {
    // Verificar si el canal ya existe en la base de datos
    const existingChannel = await ChannelRepository.findByChannelId(channelInfo.channelId);

    if (existingChannel) {
      console.log(
        `Canal "${channelInfo.name}" (${channelInfo.channelId}) ya existe en la base de datos. Actualizando información.`
      );
    } else {
      console.log(`Guardando nuevo canal "${channelInfo.name}" (${channelInfo.channelId}) en la base de datos.`);
    }

    // Preparar los datos del canal para guardar
    const channelData = {
      channelId: channelInfo.channelId,
      name: channelInfo.name,
      description: channelInfo.description,
      statistics: channelInfo.statistics,
      metadata: {
        thumbnailUrl: channelInfo.thumbnailUrl,
        country: channelInfo.country,
        customUrl: channelInfo.customUrl,
      },
      analyzedAt: new Date(),
    };

    // Si hay análisis, incluirlo
    if (channelInfo.analysis) {
      channelData.analysis = {
        targetAudience: channelInfo.analysis.targetAudience,
        mainTopics: channelInfo.analysis.mainTopics || [],
        publicationFrequency: channelInfo.analysis.publicationFrequency?.daysPerVideo,
        visualStyle: channelInfo.analysis.visualStyle,
        communicationStyle: channelInfo.analysis.communicationStyle,
      };

      // Si tenemos videos populares, guardar solo los IDs
      if (channelInfo.analysis.popularVideos && channelInfo.analysis.popularVideos.length > 0) {
        // Guardar IDs de videos
        if (typeof channelInfo.analysis.popularVideos[0] === "string") {
          // Ya son IDs, solo guardarlos como están
          channelData.analysis.popularVideos = channelInfo.analysis.popularVideos;
        } else {
          // Son objetos de video completos, extraer los IDs
          channelData.analysis.popularVideos = channelInfo.analysis.popularVideos.map((video) => video.videoId);
        }
      }
    }

    // Guardar o actualizar el canal
    const savedChannel = await ChannelRepository.updateByChannelId(channelInfo.channelId, channelData);
    return savedChannel;
  } catch (error) {
    console.error("Error al guardar canal en la base de datos:", error);
    // No lanzamos el error para no interrumpir el flujo principal
    return null;
  }
}

/**
 * Guarda los videos en la base de datos y devuelve sus IDs
 * @param {Array} videos - Lista de videos
 * @returns {Promise<Array>} - Lista de IDs de videos guardados
 */
async function saveVideosToDatabase(videos) {
  try {
    // Crear un array de promesas para procesar los videos en paralelo
    const processVideoPromises = videos.map(async (video, index) => {
      try {
        const videoData = {
          videoId: video.videoId,
          title: video.title,
          description: video.description,
          channelId: video.channelId || "",
          channelTitle: video.channelTitle || "",
          publishedAt: video.publishedAt,
          statistics: {
            viewCount: video.viewCount || 0,
            likeCount: video.likeCount || 0,
            commentCount: video.commentCount || 0,
          },
          metadata: {
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            tags: video.tags || [],
            category: video.category || "",
          },
          isShort: video.isShort || false,
          analyzedAt: new Date(),
        };

        // Obtener y guardar la transcripción
        try {
          const transcription = await getFormattedVideoTranscript(video.videoId);
          if (transcription) {
            videoData.transcription = transcription;
          }
        } catch (transcriptError) {
          console.warn(`No se pudo obtener la transcripción para ${video.videoId}:`, transcriptError);
          // Continuar sin la transcripción
        }

        // Guardar o actualizar el video
        const savedVideo = await VideoRepository.updateByVideoId(video.videoId, videoData);
        // Devolvemos el ID y el índice original para mantener el orden
        return { videoId: savedVideo.videoId, originalIndex: index };
      } catch (videoError) {
        console.error(`Error al guardar video ${video.videoId}:`, videoError);
        // Devolver null pero conservar el índice para mantener el orden
        return { videoId: null, originalIndex: index };
      }
    });

    // Esperar a que todas las promesas se resuelvan
    const results = await Promise.all(processVideoPromises);

    // Reordenar los resultados para mantener el orden original
    // y filtrar los nulos (videos que fallaron)
    const savedVideoIds = results
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map((result) => result.videoId)
      .filter((videoId) => videoId !== null);

    return savedVideoIds;
  } catch (error) {
    console.error("Error al guardar videos en la base de datos:", error);
    return [];
  }
}

/**
 * Obtiene los 10 videos más populares de un canal de YouTube (excluyendo Shorts)
 * @param {Object} params - Parámetros para la función
 * @param {string} params.channelIdentifier - ID o username del canal
 * @param {boolean} params.includeShorts - Si true, incluye Shorts en los resultados (por defecto false)
 * @param {boolean} params.forceRefresh - Si true, fuerza la actualización desde la API incluso si hay datos en caché
 * @returns {Promise<Array>} - Lista de los videos más populares del canal
 */
export async function listChannelVideos({ channelIdentifier, includeShorts = false, forceRefresh = false }) {
  try {
    // Verificar si es directamente un ID de canal o un username
    let channelId;
    let existingChannel = null;
    const isChannelId = channelIdentifier.startsWith("UC") && channelIdentifier.length > 20;

    if (isChannelId) {
      // Es un ID de canal directamente
      channelId = channelIdentifier;

      // Verificar si tenemos este canal en la base de datos
      existingChannel = await ChannelRepository.findByChannelId(channelId);
    } else {
      // Es un username, obtener la información básica del canal
      const channelInfoResult = await getChannelInfo({ channelIdentifier, fetchPopularVideos: false });
      channelId = channelInfoResult.channelId;

      if (!channelId) {
        throw new Error(`No se pudo obtener el ID del canal para ${channelIdentifier}`);
      }

      // Verificar si tenemos este canal en la base de datos
      existingChannel = await ChannelRepository.findByChannelId(channelId);
    }

    // Verificar si tenemos videos populares en caché y si son recientes (menos de 1 mes)
    if (
      !forceRefresh &&
      existingChannel &&
      existingChannel.analysis?.popularVideos &&
      existingChannel.analysis.popularVideos.length > 0
    ) {
      const lastUpdated = existingChannel.updatedAt || existingChannel.createdAt;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Si los datos son recientes (menos de 1 mes), usar datos en caché
      if (lastUpdated > oneMonthAgo) {
        console.log(
          `Usando videos populares en caché para el canal ${channelId} (última actualización: ${lastUpdated.toISOString()})`
        );

        // Obtener los videos de la base de datos usando los IDs guardados
        const videoIds = existingChannel.analysis.popularVideos;
        const cachedVideos = [];

        for (const videoId of videoIds) {
          try {
            const video = await VideoRepository.findByVideoId(videoId);
            if (video && (!video.isShort || includeShorts)) {
              // Convertir el documento a un objeto plano y adaptarlo al formato esperado
              const videoData = video.toObject();
              cachedVideos.push({
                videoId: videoData.videoId,
                title: videoData.title,
                description: videoData.description || "",
                channelId: videoData.channelId,
                channelTitle: videoData.channelTitle || "",
                publishedAt: videoData.publishedAt,
                thumbnailUrl: videoData.metadata?.thumbnailUrl || "",
                viewCount: videoData.statistics?.viewCount || 0,
                likeCount: videoData.statistics?.likeCount || 0,
                commentCount: videoData.statistics?.commentCount || 0,
                duration: videoData.metadata?.duration || "",
                isShort: videoData.isShort || false,
                transcription: videoData.transcription || null,
              });
            }
          } catch (error) {
            console.warn(`Error al obtener video en caché ${videoId}:`, error.message);
            // Continuar con el siguiente video
          }
        }

        // Si tenemos suficientes videos en caché, devolverlos
        if (cachedVideos.length >= 5) {
          // Ordenar por vistas y limitar a 10
          cachedVideos.sort((a, b) => b.viewCount - a.viewCount);
          return cachedVideos.slice(0, 10);
        }

        console.log(
          `No se encontraron suficientes videos en caché (${cachedVideos.length}/5), obteniendo desde la API...`
        );
      } else {
        console.log(`Datos en caché desactualizados para el canal ${channelId}, obteniendo desde la API...`);
      }
    }

    // Si llegamos aquí, necesitamos obtener los videos desde la API
    const maxResults = includeShorts ? 10 : 50;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error("API key de YouTube no configurada");
    }

    // Construir la URL para la API de búsqueda
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=viewCount&maxResults=${maxResults}&key=${apiKey}`;

    // Realizar la solicitud a la API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return []; // No hay videos, devolver array vacío
    }

    // Necesitamos obtener los detalles completos incluidos el número de vistas
    const videoIds = data.items.map((item) => item.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      const errorData = await detailsResponse.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();

    // Verificar si hay elementos en la respuesta
    if (!detailsData.items || detailsData.items.length === 0) {
      return []; // No hay detalles de videos, devolver array vacío
    }

    // Filtrar Shorts si es necesario
    let filteredVideos = detailsData.items;
    if (!includeShorts) {
      filteredVideos = detailsData.items.filter((video) => !isYoutubeShort(video));
    }

    // Extraer la información relevante de cada video
    const popularVideos = filteredVideos.map((video) => ({
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      channelId: channelId, // Aseguramos que se use el ID del canal que estamos analizando
      channelTitle: video.snippet.channelTitle,
      publishedAt: new Date(video.snippet.publishedAt),
      thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
      viewCount: parseInt(video.statistics.viewCount, 10),
      likeCount: parseInt(video.statistics.likeCount || 0, 10),
      commentCount: parseInt(video.statistics.commentCount || 0, 10),
      duration: video.contentDetails?.duration,
      isShort: isYoutubeShort(video),
    }));

    // Ordenar por número de vistas (más alto primero)
    popularVideos.sort((a, b) => b.viewCount - a.viewCount);

    // Limitar a 10 resultados
    const finalResults = popularVideos.slice(0, 10);

    // Guardar los resultados en la base de datos (para cualquier tipo de identificador)
    try {
      // Guardar los videos en la base de datos (incluida la transcripción)
      await saveVideosToDatabase(finalResults);

      // Recuperar los videos con sus transcripciones desde la base de datos
      const videosWithTranscriptions = [];
      for (const video of finalResults) {
        try {
          const videoFromDB = await VideoRepository.findByVideoId(video.videoId);
          if (videoFromDB) {
            // Convertir el documento a un objeto plano y mantener propiedades originales
            const videoData = videoFromDB.toObject();
            // Combinar datos originales con datos de la BD (para preservar propiedades como viewCount)
            videosWithTranscriptions.push({
              ...video,
              transcription: videoData.transcription || null,
            });
          } else {
            // Si no se encontró en la BD por alguna razón, usar el original
            videosWithTranscriptions.push(video);
          }
        } catch (videoError) {
          console.warn(`Error al recuperar transcripción para video ${video.videoId}:`, videoError.message);
          videosWithTranscriptions.push(video);
        }
      }

      // Usar los videos con transcripciones
      const responseVideos = videosWithTranscriptions;

      // Obtener o crear el canal y guardar los IDs de videos populares
      let channelData;
      if (existingChannel) {
        // Actualizar el canal existente con los nuevos videos populares
        if (!existingChannel.analysis) {
          existingChannel.analysis = {};
        }
        existingChannel.analysis.popularVideos = finalResults.map((video) => video.videoId);
        existingChannel.updatedAt = new Date(); // Actualizar la fecha de modificación
        await existingChannel.save();
        channelData = existingChannel;
      } else {
        // Si no tenemos información del canal, intentar obtenerla
        let channelToSave;
        if (isChannelId) {
          try {
            // Intentar obtener información del canal usando la API de YouTube
            const channelInfoResult = await getChannelInfo({ channelIdentifier, fetchPopularVideos: false });
            channelToSave = channelInfoResult;
          } catch (error) {
            // Si no podemos obtener la info, crear un canal básico
            channelToSave = {
              channelId,
              name: finalResults[0]?.channelTitle || "Canal desconocido",
              analysis: {
                popularVideos: finalResults.map((video) => video.videoId),
              },
            };
          }
        } else {
          // Ya tenemos la información del canal
          const channelInfoResult = await getChannelInfo({ channelIdentifier, fetchPopularVideos: false });
          channelToSave = channelInfoResult;
          if (!channelToSave.analysis) {
            channelToSave.analysis = {};
          }
          channelToSave.analysis.popularVideos = finalResults.map((video) => video.videoId);
        }

        // Guardar el canal en la base de datos
        channelData = await saveChannelToDatabase(channelToSave);
      }

      console.log(`Canal actualizado con ${finalResults.length} videos populares.`);
    } catch (saveError) {
      console.error("Error al guardar datos en BD:", saveError);
      // Continuamos para devolver los videos aunque haya error en la BD
    }

    return responseVideos;
  } catch (error) {
    console.error("Error en listChannelVideos:", error);
    throw new Error(`Error al listar los videos populares del canal: ${error.message}`);
  }
}
