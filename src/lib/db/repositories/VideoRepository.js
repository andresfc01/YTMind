import Video from "../models/Video";
import connectToDatabase from "../connect";
import mongoose from "mongoose";

/**
 * Clase repositorio para operaciones CRUD con videos de YouTube
 */
class VideoRepository {
  /**
   * Verificar la conexión a la base de datos
   * @private
   */
  static async _verifyConnection() {
    await connectToDatabase();
  }

  /**
   * Crear un nuevo video
   * @param {Object} videoData - Datos del video
   * @returns {Promise<Object>} - El video creado
   */
  static async create(videoData) {
    await this._verifyConnection();
    const video = new Video(videoData);
    await video.save();
    return video;
  }

  /**
   * Buscar todos los videos
   * @param {Object} filter - Filtro para la búsqueda
   * @param {Object} options - Opciones para la búsqueda
   * @returns {Promise<Array>} - Lista de videos
   */
  static async findAll(filter = {}, options = {}) {
    await this._verifyConnection();

    const { sort = { publishedAt: -1 }, limit = 10, skip = 0 } = options;

    return Video.find(filter).sort(sort).skip(skip).limit(limit);
  }

  /**
   * Buscar un video por su ID
   * @param {string} id - ID del video en la base de datos
   * @returns {Promise<Object>} - El video encontrado
   */
  static async findById(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de video inválido: ${id}`);
    }
    const video = await Video.findById(id);
    if (!video) {
      throw new Error(`Video con ID ${id} no encontrado`);
    }
    return video;
  }

  /**
   * Buscar un video por su ID de YouTube
   * @param {string} videoId - ID de YouTube del video
   * @returns {Promise<Object|null>} - El video encontrado o null si no existe
   */
  static async findByVideoId(videoId) {
    await this._verifyConnection();
    return Video.findOne({ videoId });
  }

  /**
   * Buscar videos por ID de canal
   * @param {string} channelId - ID del canal
   * @param {Object} options - Opciones para la búsqueda
   * @returns {Promise<Array>} - Lista de videos del canal
   */
  static async findByChannelId(channelId, options = { sort: { viewCount: -1 }, limit: 10 }) {
    await this._verifyConnection();
    return Video.find({ channelId }).sort(options.sort).limit(options.limit);
  }

  /**
   * Actualizar un video
   * @param {string} id - ID del video a actualizar en la base de datos
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - El video actualizado
   */
  static async update(id, updateData) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de video inválido: ${id}`);
    }

    const video = await Video.findById(id);
    if (!video) {
      throw new Error(`Video con ID ${id} no encontrado`);
    }

    // Actualizar los campos
    Object.keys(updateData).forEach((key) => {
      video[key] = updateData[key];
    });

    await video.save();
    return video;
  }

  /**
   * Actualizar un video por su ID de YouTube
   * @param {string} videoId - ID de YouTube del video
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - El video actualizado o creado
   */
  static async updateByVideoId(videoId, updateData) {
    await this._verifyConnection();

    // Buscar el video o crear uno nuevo si no existe
    let video = await this.findByVideoId(videoId);

    if (video) {
      // Actualizar campos existentes
      Object.keys(updateData).forEach((key) => {
        video[key] = updateData[key];
      });
    } else {
      // Crear un nuevo video si no existe
      if (!updateData.videoId) {
        updateData.videoId = videoId;
      }
      video = new Video(updateData);
    }

    await video.save();
    return video;
  }

  /**
   * Eliminar un video
   * @param {string} id - ID del video a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async delete(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de video inválido: ${id}`);
    }
    const result = await Video.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Video con ID ${id} no encontrado`);
    }
    return { success: true, message: `Video con ID ${id} eliminado` };
  }

  /**
   * Obtener el número total de videos
   * @param {Object} filter - Filtro opcional para el conteo
   * @returns {Promise<number>} - Número de videos
   */
  static async count(filter = {}) {
    await this._verifyConnection();
    return Video.countDocuments(filter);
  }
}

export default VideoRepository;
