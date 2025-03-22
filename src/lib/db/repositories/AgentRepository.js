import Agent from "../models/Agent";
import connectToDatabase from "../connect";
import mongoose from "mongoose";
import { getFunctionByName } from "@/lib/functions";

/**
 * Clase repositorio para operaciones CRUD con agentes
 */
class AgentRepository {
  /**
   * Verificar la conexión a la base de datos
   * @private
   */
  static async _verifyConnection() {
    await connectToDatabase();
  }

  /**
   * Crear un nuevo agente
   * @param {Object} agentData - Datos del agente
   * @returns {Promise<Object>} - El agente creado
   */
  static async create(agentData) {
    await this._verifyConnection();
    const agent = new Agent(agentData);
    await agent.save();
    return agent;
  }

  /**
   * Buscar todos los agentes
   * @param {Object} filter - Filtro para la búsqueda
   * @param {Object} options - Opciones para la búsqueda
   * @returns {Promise<Array>} - Lista de agentes
   */
  static async findAll(filter = {}, options = { sort: { createdAt: -1 } }) {
    await this._verifyConnection();
    return Agent.find(filter).sort(options.sort);
  }

  /**
   * Buscar un agente por su ID
   * @param {string} id - ID del agente
   * @returns {Promise<Object>} - El agente encontrado
   */
  static async findById(id) {
    try {
      await this._verifyConnection();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const agent = await Agent.findById(id);

      return agent;
    } catch (error) {
      console.error(`[AgentRepository] Error finding agent by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar un agente
   * @param {string} id - ID del agente a actualizar
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - El agente actualizado
   */
  static async update(id, updateData) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de agente inválido: ${id}`);
    }

    // Asegurarnos de que los campos numéricos sean números
    if (typeof updateData.temperature !== "undefined") {
      updateData.temperature = parseFloat(updateData.temperature);
      if (isNaN(updateData.temperature)) {
        throw new Error("El valor de temperature debe ser un número válido");
      }
    }

    // Verificar si estamos actualizando las funciones
    if (updateData.functions) {
      // Asegurarse de que las funciones tengan el formato correcto
      if (Array.isArray(updateData.functions)) {
        // Transformar cada función al formato correcto
        const validatedFunctions = [];

        for (const func of updateData.functions) {
          // Si es un string (nombre de función), buscamos la función completa
          if (typeof func === "string") {
            const functionDef = getFunctionByName(func);
            if (functionDef) {
              validatedFunctions.push({
                name: functionDef.name,
                description: functionDef.description,
                parameters: functionDef.parameters,
              });
            } else {
              console.warn(`Función '${func}' no encontrada, se omitirá`);
            }
            continue;
          }

          // Si ya es un objeto completo y válido, lo usamos directamente
          if (func && typeof func === "object" && func.name && func.description && func.parameters) {
            validatedFunctions.push(func);
            continue;
          }

          // Para otros formatos, intentamos recuperar por nombre si es posible
          if (func && typeof func === "object" && func.name) {
            const functionDef = getFunctionByName(func.name);
            if (functionDef) {
              validatedFunctions.push({
                name: functionDef.name,
                description: functionDef.description,
                parameters: functionDef.parameters,
              });
            } else {
              console.warn(`No se encontró definición para: ${func.name}`);
            }
            continue;
          }

          console.warn(`Formato no reconocido, omitiendo:`, func);
        }

        updateData.functions = validatedFunctions;
      } else {
        // Si no es un array, lo convertimos en un array vacío
        console.error("Las funciones no son un array:", updateData.functions);
        updateData.functions = [];
      }
    }

    // Encontrar el agente primero
    const agent = await Agent.findById(id);
    if (!agent) {
      throw new Error(`Agente con ID ${id} no encontrado`);
    }

    // Actualizar los campos
    Object.keys(updateData).forEach((key) => {
      agent[key] = updateData[key];
    });

    // Guardar los cambios
    try {
      await agent.save();
    } catch (error) {
      console.error(`Error al guardar el agente ${id}:`, error);
      throw error;
    }

    return agent;
  }

  /**
   * Eliminar un agente
   * @param {string} id - ID del agente a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  static async delete(id) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de agente inválido: ${id}`);
    }
    const result = await Agent.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Agente con ID ${id} no encontrado`);
    }
    return { success: true, message: `Agente con ID ${id} eliminado` };
  }

  /**
   * Obtener el número total de agentes
   * @returns {Promise<number>} - Número de agentes
   */
  static async count() {
    await this._verifyConnection();
    return Agent.countDocuments();
  }

  /**
   * Buscar agentes por categoría
   * @param {string} category - Categoría de agentes
   * @returns {Promise<Array>} - Lista de agentes de la categoría
   */
  static async findByCategory(category) {
    await this._verifyConnection();
    return Agent.find({ category }).sort({ createdAt: -1 });
  }

  /**
   * Obtener los agentes predeterminados
   * @returns {Promise<Array>} - Lista de agentes predeterminados
   */
  static async getDefaultAgents() {
    await this._verifyConnection();
    return Agent.find({ isDefault: true }).sort({ category: 1, name: 1 });
  }

  /**
   * Añadir un documento al agente
   * @param {string} agentId - ID del agente
   * @param {string} documentId - ID del documento
   * @returns {Promise<Object>} - El agente actualizado
   */
  static async addDocument(agentId, documentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error(`ID de documento inválido: ${documentId}`);
    }

    // Verificar si el documento ya está asociado al agente
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new Error(`Agente con ID ${agentId} no encontrado`);
    }

    // Verificamos si documents es un array y lo inicializamos si no existe
    if (!agent.documents) {
      agent.documents = [];
    }

    // Verificamos si el documento ya está en el agente
    if (agent.documents.includes(documentId)) {
      return agent;
    }

    // Añadir el documento al agente
    agent.documents.push(documentId);
    await agent.save();

    return agent;
  }

  /**
   * Eliminar un documento del agente
   * @param {string} agentId - ID del agente
   * @param {string} documentId - ID del documento
   * @returns {Promise<Object>} - El agente actualizado
   */
  static async removeDocument(agentId, documentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new Error(`ID de documento inválido: ${documentId}`);
    }

    // Verificar si el agente existe
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new Error(`Agente con ID ${agentId} no encontrado`);
    }

    // Verificamos si documents es un array
    if (!agent.documents || !Array.isArray(agent.documents)) {
      agent.documents = [];
      await agent.save();
      return agent;
    }

    // Eliminar el documento del agente
    agent.documents = agent.documents.filter((docId) => docId.toString() !== documentId);
    await agent.save();

    return agent;
  }

  /**
   * Obtener los documentos de un agente (solo IDs)
   * @param {string} agentId - ID del agente
   * @returns {Promise<Array>} - Lista de IDs de documentos
   */
  static async getDocumentIds(agentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new Error(`Agente con ID ${agentId} no encontrado`);
    }

    return agent.documents || [];
  }

  /**
   * Añadir una URL al agente
   * @param {string} agentId - ID del agente
   * @param {string} urlId - ID de la URL
   * @returns {Promise<Object>} - El agente actualizado
   */
  static async addUrl(agentId, urlId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(urlId)) {
      throw new Error(`ID de URL inválido: ${urlId}`);
    }

    // Verificar si la URL ya está asociada al agente
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new Error(`Agente con ID ${agentId} no encontrado`);
    }

    // Verificamos si urls es un array y lo inicializamos si no existe
    if (!agent.urls) {
      agent.urls = [];
    }

    // Verificamos si la URL ya está en el agente
    if (agent.urls.includes(urlId)) {
      return agent;
    }

    // Añadir la URL al agente
    agent.urls.push(urlId);
    await agent.save();

    return agent;
  }

  /**
   * Eliminar una URL del agente
   * @param {string} agentId - ID del agente
   * @param {string} urlId - ID de la URL
   * @returns {Promise<Object>} - El agente actualizado
   */
  static async removeUrl(agentId, urlId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(urlId)) {
      throw new Error(`ID de URL inválido: ${urlId}`);
    }

    // Verificar si el agente existe
    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new Error(`Agente con ID ${agentId} no encontrado`);
    }

    // Verificamos si urls es un array
    if (!agent.urls || !Array.isArray(agent.urls)) {
      agent.urls = [];
      await agent.save();
      return agent;
    }

    // Eliminar la URL del agente
    agent.urls = agent.urls.filter((id) => id.toString() !== urlId);
    await agent.save();

    return agent;
  }

  /**
   * Obtener las URLs de un agente (solo IDs)
   * @param {string} agentId - ID del agente
   * @returns {Promise<Array>} - Lista de IDs de URLs
   */
  static async getUrlIds(agentId) {
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      throw new Error(`ID de agente inválido: ${agentId}`);
    }

    const agent = await Agent.findById(agentId);
    if (!agent) {
      throw new Error(`Agente con ID ${agentId} no encontrado`);
    }

    return agent.urls || [];
  }
}

export default AgentRepository;
