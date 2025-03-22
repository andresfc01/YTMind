import Channel from "../models/Channel";
import connectToDatabase from "../connect";
import mongoose from "mongoose";

/**
 * Clase repositorio para operaciones CRUD con canales de YouTube
 */
class ChannelRepository {
  /**
   * Verificar la conexión a la base de datos
   * @private
   */
  static async _verifyConnection() {
    await connectToDatabase();
  }

  /**
   * Crear un nuevo canal
   * @param {Object} channelData - Datos del canal
   * @returns {Promise<Object>} - El canal creado
   */
  static async create(channelData) {
    await this._verifyConnection();
    const channel = new Channel(channelData);
    await channel.save();
    return channel;
  }

  /**
   * Buscar todos los canales
   * @param {Object} filter - Filtro para la búsqueda
   * @param {Object} options - Opciones para la búsqueda
   * @returns {Promise<Array>} - Lista de canales
   */
  static async findAll(filter = {}, options = { sort: { createdAt: -1 } }) {
    await this._verifyConnection();
    return Channel.find(filter).sort(options.sort);
  }

  /**
   * Buscar un canal por su ID
   * @param {string} id - ID del canal en la base de datos
   * @returns {Promise<Object>} - El canal encontrado
   */
  static async findById(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de canal inválido: ${id}`);
    }
    const channel = await Channel.findById(id);
    if (!channel) {
      throw new Error(`Canal con ID ${id} no encontrado`);
    }
    return channel;
  }

  /**
   * Buscar un canal por su ID de YouTube
   * @param {string} channelId - ID de YouTube del canal
   * @returns {Promise<Object|null>} - El canal encontrado o null si no existe
   */
  static async findByChannelId(channelId) {
    await this._verifyConnection();
    return Channel.findOne({ channelId });
  }

  /**
   * Actualizar un canal
   * @param {string} id - ID del canal a actualizar en la base de datos
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - El canal actualizado
   */
  static async update(id, updateData) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de canal inválido: ${id}`);
    }

    const channel = await Channel.findById(id);
    if (!channel) {
      throw new Error(`Canal con ID ${id} no encontrado`);
    }

    // Actualizar los campos
    Object.keys(updateData).forEach((key) => {
      channel[key] = updateData[key];
    });

    await channel.save();
    return channel;
  }

  /**
   * Actualizar un canal por su ID de YouTube
   * @param {string} channelId - ID de YouTube del canal
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - El canal actualizado o creado
   */
  static async updateByChannelId(channelId, updateData) {
    await this._verifyConnection();

    // Buscar el canal o crear uno nuevo si no existe
    let channel = await this.findByChannelId(channelId);

    if (channel) {
      // Actualizar campos existentes
      Object.keys(updateData).forEach((key) => {
        channel[key] = updateData[key];
      });
    } else {
      // Crear un nuevo canal si no existe
      if (!updateData.channelId) {
        updateData.channelId = channelId;
      }
      channel = new Channel(updateData);
    }

    await channel.save();
    return channel;
  }

  /**
   * Eliminar un canal
   * @param {string} id - ID del canal a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async delete(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de canal inválido: ${id}`);
    }
    const result = await Channel.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Canal con ID ${id} no encontrado`);
    }
    return { success: true, message: `Canal con ID ${id} eliminado` };
  }

  /**
   * Obtener el número total de canales
   * @returns {Promise<number>} - Número de canales
   */
  static async count() {
    await this._verifyConnection();
    return Channel.countDocuments();
  }
}

export default ChannelRepository;
