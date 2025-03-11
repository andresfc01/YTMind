import Url from "../models/Url";
import connectToDatabase from "../connect";
import mongoose from "mongoose";

/**
 * Clase repositorio para operaciones CRUD con URLs
 */
class UrlRepository {
  /**
   * Verificar la conexión a la base de datos
   * @private
   */
  static async _verifyConnection() {
    await connectToDatabase();
    console.log(`Operación en base de datos: ${mongoose.connection.db.databaseName}`);
  }

  /**
   * Crear una nueva URL
   * @param {Object} urlData - Datos de la URL
   * @returns {Promise<Object>} - La URL creada
   */
  static async create(urlData) {
    await this._verifyConnection();

    // Verificar que los datos contienen lo mínimo requerido
    if (!urlData.url || !urlData.agentId || !urlData.content) {
      throw new Error("URL, agentId y content son campos obligatorios");
    }

    console.log(`Creando URL para el agente ${urlData.agentId}: ${urlData.url}`);

    const url = new Url(urlData);
    await url.save();
    return url;
  }

  /**
   * Buscar todas las URLs
   * @param {Object} filter - Filtro para la búsqueda
   * @param {Object} options - Opciones para la búsqueda
   * @returns {Promise<Array>} - Lista de URLs
   */
  static async findAll(filter = {}, options = { sort: { createdAt: -1 } }) {
    await this._verifyConnection();
    return Url.find(filter).sort(options.sort);
  }

  /**
   * Buscar una URL por su ID
   * @param {string} id - ID de la URL
   * @returns {Promise<Object>} - La URL encontrada
   */
  static async findById(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de URL inválido: ${id}`);
    }
    return Url.findById(id);
  }

  /**
   * Buscar URLs por agente
   * @param {string} agentId - ID del agente
   * @returns {Promise<Array>} - Lista de URLs del agente
   */
  static async findByAgentId(agentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }
    return Url.find({ agentId }).sort({ createdAt: -1 });
  }

  /**
   * Actualizar una URL
   * @param {string} id - ID de la URL
   * @param {Object} updateData - Datos para actualizar
   * @returns {Promise<Object>} - La URL actualizada
   */
  static async update(id, updateData) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de URL inválido: ${id}`);
    }

    console.log(`Actualizando URL con ID ${id}`);

    const updatedUrl = await Url.findByIdAndUpdate(id, { ...updateData, updatedAt: new Date() }, { new: true });

    if (!updatedUrl) {
      throw new Error(`URL con ID ${id} no encontrada`);
    }

    return updatedUrl;
  }

  /**
   * Eliminar una URL
   * @param {string} id - ID de la URL
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async delete(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de URL inválido: ${id}`);
    }

    const url = await Url.findById(id);
    if (!url) {
      throw new Error(`URL con ID ${id} no encontrada`);
    }

    return Url.findByIdAndDelete(id);
  }

  /**
   * Eliminar todas las URLs de un agente
   * @param {string} agentId - ID del agente
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async deleteByAgentId(agentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }

    return Url.deleteMany({ agentId });
  }

  /**
   * Contar URLs
   * @returns {Promise<Number>} - Número de URLs
   */
  static async count() {
    await this._verifyConnection();
    return Url.countDocuments();
  }
}

export default UrlRepository;
