import Chat from "../models/Chat";
import connectToDatabase from "../connect";
import mongoose from "mongoose";

/**
 * Clase repositorio para operaciones CRUD con chats
 */
class ChatRepository {
  /**
   * Verificar la conexión a la base de datos
   * @private
   */
  static async _verifyConnection() {
    await connectToDatabase();
    console.log(`Operación en base de datos: ${mongoose.connection.db.databaseName}`);
  }

  /**
   * Crear un nuevo chat
   * @param {Object} chatData - Datos del chat
   * @returns {Promise<Object>} - El chat creado
   */
  static async create(chatData) {
    await this._verifyConnection();
    const chat = new Chat(chatData);
    console.log(`Creando chat "${chatData.title}" en ${mongoose.connection.db.databaseName}`);
    await chat.save();
    return chat;
  }

  /**
   * Obtener todos los chats
   * @param {Object} filter - Filtros para la consulta
   * @param {Object} options - Opciones de paginación y ordenación
   * @returns {Promise<Array>} - Lista de chats
   */
  static async findAll(filter = {}, options = { sort: { createdAt: -1 } }) {
    await this._verifyConnection();
    console.log(`Buscando chats en ${mongoose.connection.db.databaseName}`);
    return Chat.find(filter, null, options);
  }

  /**
   * Obtener un chat por su ID
   * @param {string} id - ID del chat
   * @returns {Promise<Object>} - El chat encontrado
   */
  static async findById(id) {
    await this._verifyConnection();
    console.log(`Buscando chat ${id} en ${mongoose.connection.db.databaseName}`);
    return Chat.findById(id);
  }

  /**
   * Actualizar un chat existente
   * @param {string} id - ID del chat
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - El chat actualizado
   */
  static async update(id, updateData) {
    await this._verifyConnection();
    console.log(`Actualizando chat ${id} en ${mongoose.connection.db.databaseName}`);
    return Chat.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * Añadir un mensaje a un chat existente
   * @param {string} chatId - ID del chat
   * @param {Object} message - Mensaje a añadir
   * @returns {Promise<Object>} - El chat actualizado
   */
  static async addMessage(chatId, message) {
    await this._verifyConnection();

    // Validar que el rol sea válido
    if (!["user", "assistant", "system"].includes(message.role)) {
      throw new Error(`Rol no válido: ${message.role}`);
    }

    try {
      const result = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() },
        },
        { new: true }
      );

      return result || null;
    } catch (error) {
      console.error(`Error al añadir mensaje a chat ${chatId}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar un chat
   * @param {string} id - ID del chat
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async delete(id) {
    await this._verifyConnection();
    console.log(`Eliminando chat ${id} en ${mongoose.connection.db.databaseName}`);
    return Chat.findByIdAndDelete(id);
  }

  /**
   * Contar documentos de chat
   * @returns {Promise<Number>} - Número de chats
   */
  static async count() {
    await this._verifyConnection();
    return Chat.countDocuments();
  }
}

export default ChatRepository;
