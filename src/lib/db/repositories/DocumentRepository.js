import Document from "../models/Document";
import connectToDatabase from "../connect";
import mongoose from "mongoose";

/**
 * Clase repositorio para operaciones CRUD con documentos
 */
class DocumentRepository {
  /**
   * Verificar la conexión a la base de datos
   * @private
   */
  static async _verifyConnection() {
    await connectToDatabase();
    console.log(`Operación en base de datos: ${mongoose.connection.db.databaseName}`);
  }

  /**
   * Crear un nuevo documento
   * @param {Object} documentData - Datos del documento
   * @returns {Promise<Object>} - El documento creado
   */
  static async create(documentData) {
    await this._verifyConnection();
    const document = new Document(documentData);
    console.log(`Creando documento "${documentData.name}" para el agente ${documentData.agentId}`);
    await document.save();
    return document;
  }

  /**
   * Buscar todos los documentos
   * @param {Object} filter - Filtro para la búsqueda
   * @param {Object} options - Opciones para la búsqueda
   * @returns {Promise<Array>} - Lista de documentos
   */
  static async findAll(filter = {}, options = { sort: { createdAt: -1 } }) {
    await this._verifyConnection();
    return Document.find(filter).sort(options.sort);
  }

  /**
   * Buscar un documento por su ID
   * @param {string} id - ID del documento
   * @returns {Promise<Object>} - El documento encontrado
   */
  static async findById(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de documento inválido: ${id}`);
    }
    return Document.findById(id);
  }

  /**
   * Buscar documentos por agente
   * @param {string} agentId - ID del agente
   * @returns {Promise<Array>} - Lista de documentos del agente
   */
  static async findByAgentId(agentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }
    return Document.find({ agentId }).sort({ createdAt: -1 });
  }

  /**
   * Actualizar un documento
   * @param {string} id - ID del documento
   * @param {Object} updateData - Datos para actualizar
   * @returns {Promise<Object>} - El documento actualizado
   */
  static async update(id, updateData) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de documento inválido: ${id}`);
    }

    console.log(`Actualizando documento con ID ${id}`);

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedDocument) {
      throw new Error(`Documento con ID ${id} no encontrado`);
    }

    return updatedDocument;
  }

  /**
   * Eliminar un documento
   * @param {string} id - ID del documento
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async delete(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de documento inválido: ${id}`);
    }

    const document = await Document.findById(id);
    if (!document) {
      throw new Error(`Documento con ID ${id} no encontrado`);
    }

    return Document.findByIdAndDelete(id);
  }

  /**
   * Eliminar todos los documentos de un agente
   * @param {string} agentId - ID del agente
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async deleteByAgentId(agentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }

    return Document.deleteMany({ agentId });
  }

  /**
   * Contar documentos
   * @returns {Promise<Number>} - Número de documentos
   */
  static async count() {
    await this._verifyConnection();
    return Document.countDocuments();
  }
}

export default DocumentRepository;
