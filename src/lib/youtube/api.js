/**
 * Cliente para la API de YouTube
 */

import ChannelRepository from "../db/repositories/ChannelRepository";

/**
 * Busca un canal por su username y devuelve su ID
 * @param {string} username - Username del canal de YouTube
 * @returns {Promise<string>} - ID del canal
 */
export async function getChannelIdFromUsername(username) {
  try {
    // Validar que tenemos una API key
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("No se ha configurado YOUTUBE_API_KEY en las variables de entorno");
    }

    // Si el username comienza con @, intentar directamente con la API moderna
    if (username.startsWith("@")) {
      // Usar directamente el handle con @ en la API de búsqueda
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
        username
      )}&key=${process.env.YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(`Error en la API de YouTube: ${errorData.error?.message || searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        throw new Error(`No se encontró el canal con handle: ${username}`);
      }

      // Devolver el ID del primer resultado
      return searchData.items[0].id.channelId;
    }

    // Para usernames sin @, intentar primero con forUsername (método antiguo)
    // Construir la URL de la API usando forUsername
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${username}&key=${process.env.YOUTUBE_API_KEY}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Verificar si se encontró el canal
    if (!data.items || data.items.length === 0) {
      // Si no se encuentra por username, intentar buscar por término
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${username}&key=${process.env.YOUTUBE_API_KEY}`;
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(`Error en la API de YouTube: ${errorData.error?.message || searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        throw new Error(`No se encontró el canal con username: ${username}`);
      }

      // Devolver el ID del primer resultado
      return searchData.items[0].id.channelId;
    }

    return data.items[0].id;
  } catch (error) {
    console.error("Error al obtener ID del canal:", error);
    throw error;
  }
}

/**
 * Obtiene información básica de un canal de YouTube y la guarda en la base de datos
 * @param {string} channelIdentifier - ID o username del canal de YouTube
 * @returns {Promise<Object>} - Información del canal
 */
export async function fetchChannelInfo(channelIdentifier) {
  try {
    // Determinar si es un ID o un username/formato personalizado
    let channelId = channelIdentifier;

    // Si es un ID de canal (comienza con UC), lo usamos directamente
    if (!channelIdentifier.startsWith("UC")) {
      // Manejo de formatos de nombre de usuario
      let username = channelIdentifier;

      // Si comienza con @, c/ o user/, extraer el nombre de usuario
      if (channelIdentifier.startsWith("@")) {
        // Para handles con @ no eliminamos el @ ya que la API los acepta directamente
        username = channelIdentifier;
      } else if (channelIdentifier.startsWith("c/")) {
        username = channelIdentifier.substring(2); // Quitar el c/ del inicio
      } else if (channelIdentifier.startsWith("user/")) {
        username = channelIdentifier.substring(5); // Quitar el user/ del inicio
      }

      // Intentar buscar por canal directamente con el handle (@username)
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
          username
        )}&key=${process.env.YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          const errorData = await searchResponse.json();
          throw new Error(`Error en la API de YouTube: ${errorData.error?.message || searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();

        if (searchData.items && searchData.items.length > 0) {
          channelId = searchData.items[0].id.channelId;
          console.log(`Canal encontrado para ${username}: ${channelId}`);
        } else {
          // Si falla, intentar el método anterior
          channelId = await getChannelIdFromUsername(username.replace(/^@/, ""));
        }
      } catch (searchError) {
        console.warn(`Error buscando canal con handle ${username}:`, searchError);
        // Intentar el método anterior como respaldo
        channelId = await getChannelIdFromUsername(username.replace(/^@/, ""));
      }
    }

    // Validar que tenemos una API key
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("No se ha configurado YOUTUBE_API_KEY en las variables de entorno");
    }

    // Primero intentar obtener de la base de datos
    try {
      const existingChannel = await ChannelRepository.findByChannelId(channelId);
      if (existingChannel) {
        // Si el canal existe y fue analizado hace menos de 24 horas, devolver los datos guardados
        const hoursAgo = (Date.now() - existingChannel.analyzedAt.getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 24) {
          console.log(`Usando datos en caché para el canal ${channelId}`);
          return existingChannel;
        }
      }
    } catch (error) {
      console.warn("Error al buscar en la base de datos:", error);
      // Continuar con la petición a la API
    }

    // Construir la URL de la API
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`;

    // Realizar la petición
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Verificar si se encontró el canal
    if (!data.items || data.items.length === 0) {
      throw new Error(`No se encontró el canal con ID: ${channelId}`);
    }

    // Extraer la información relevante
    const channelData = data.items[0];

    // Preparar los datos para guardar
    const channelInfo = {
      channelId: channelData.id,
      name: channelData.snippet.title,
      description: channelData.snippet.description,
      statistics: {
        videoCount: parseInt(channelData.statistics.videoCount, 10),
        subscriberCount: parseInt(channelData.statistics.subscriberCount, 10),
        viewCount: parseInt(channelData.statistics.viewCount, 10),
      },
      metadata: {
        thumbnailUrl: channelData.snippet.thumbnails.high?.url || channelData.snippet.thumbnails.default?.url,
        country: channelData.snippet.country,
        startDate: new Date(channelData.snippet.publishedAt),
        customUrl: channelData.snippet.customUrl,
      },
      analyzedAt: new Date(),
    };

    // Guardar o actualizar en la base de datos
    try {
      await ChannelRepository.updateByChannelId(channelId, channelInfo);
      console.log(`Canal ${channelId} guardado/actualizado en la base de datos`);
    } catch (error) {
      console.error("Error al guardar en la base de datos:", error);
      // No lanzar el error para no interrumpir la respuesta
    }

    return channelInfo;
  } catch (error) {
    console.error("Error al obtener información del canal:", error);
    throw error;
  }
}

/**
 * Obtiene los videos más recientes de un canal
 * @param {string} channelId - ID del canal de YouTube
 * @param {Object} options - Opciones adicionales
 * @param {number} options.maxResults - Número máximo de resultados (por defecto 10)
 * @returns {Promise<Array>} - Lista de videos
 */
export async function fetchChannelVideos(channelId, { maxResults = 10 } = {}) {
  try {
    // Validar que tenemos una API key
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("No se ha configurado YOUTUBE_API_KEY en las variables de entorno");
    }

    // Primero obtenemos el ID de la lista de subidas del canal
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!channelResponse.ok) {
      const errorData = await channelResponse.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      throw new Error(`No se encontró el canal con ID: ${channelId}`);
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Ahora obtenemos los videos de la lista de subidas
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || videosResponse.statusText}`);
    }

    const videosData = await videosResponse.json();

    // Extraer la información relevante de cada video
    return videosData.items.map((item) => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: new Date(item.snippet.publishedAt),
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
    }));
  } catch (error) {
    console.error("Error al obtener videos del canal:", error);
    throw error;
  }
}

/**
 * Obtiene información detallada de un video
 * @param {string} videoId - ID del video de YouTube
 * @returns {Promise<Object>} - Información del video
 */
export async function fetchVideoDetails(videoId) {
  try {
    // Validar que tenemos una API key
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error("No se ha configurado YOUTUBE_API_KEY en las variables de entorno");
    }

    // Construir la URL de la API
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;

    // Realizar la petición
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API de YouTube: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Verificar si se encontró el video
    if (!data.items || data.items.length === 0) {
      throw new Error(`No se encontró el video con ID: ${videoId}`);
    }

    // Extraer la información relevante
    const videoData = data.items[0];

    return {
      videoId: videoData.id,
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      channelId: videoData.snippet.channelId,
      channelTitle: videoData.snippet.channelTitle,
      publishedAt: new Date(videoData.snippet.publishedAt),
      statistics: {
        viewCount: parseInt(videoData.statistics.viewCount, 10),
        likeCount: parseInt(videoData.statistics.likeCount, 10),
        commentCount: parseInt(videoData.statistics.commentCount, 10),
      },
      metadata: {
        thumbnailUrl: videoData.snippet.thumbnails.high?.url || videoData.snippet.thumbnails.default?.url,
        duration: videoData.contentDetails.duration,
        tags: videoData.snippet.tags || [],
        category: videoData.snippet.categoryId,
      },
    };
  } catch (error) {
    console.error("Error al obtener detalles del video:", error);
    throw error;
  }
}
