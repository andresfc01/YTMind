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
    console.log(`Operación en base de datos: ${mongoose.connection.db.databaseName}`);
  }

  /**
   * Crear un nuevo agente
   * @param {Object} agentData - Datos del agente
   * @returns {Promise<Object>} - El agente creado
   */
  static async create(agentData) {
    await this._verifyConnection();
    const agent = new Agent(agentData);
    console.log(`Creando agente "${agentData.name}" en ${mongoose.connection.db.databaseName}`);
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
    await this._verifyConnection();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`ID de agente inválido: ${id}`);
    }
    const agent = await Agent.findById(id);
    if (!agent) {
      throw new Error(`Agente con ID ${id} no encontrado`);
    }
    return agent;
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

    console.log(`Actualizando agente con ID ${id}`);
    console.log("Datos de actualización:", JSON.stringify(updateData, null, 2));

    // Asegurarnos de que los campos numéricos sean números
    if (typeof updateData.temperature !== "undefined") {
      updateData.temperature = parseFloat(updateData.temperature);
      if (isNaN(updateData.temperature)) {
        throw new Error("El valor de temperature debe ser un número válido");
      }
    }

    // Verificar si estamos actualizando las funciones
    if (updateData.functions) {
      console.log("Validando funciones a actualizar:", updateData.functions);

      // Asegurarse de que las funciones tengan el formato correcto
      if (Array.isArray(updateData.functions)) {
        // Transformar cada función al formato correcto
        const validatedFunctions = [];

        for (const func of updateData.functions) {
          // Si es un string (nombre de función), buscamos la función completa
          if (typeof func === "string") {
            console.log(`Procesando función por nombre: ${func}`);
            const functionDef = getFunctionByName(func);
            if (functionDef) {
              console.log(`Función '${func}' encontrada, añadiendo a la lista`);
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
            console.log(`Función con formato completo: ${func.name}`);
            validatedFunctions.push(func);
            continue;
          }

          // Para otros formatos, intentamos recuperar por nombre si es posible
          if (func && typeof func === "object" && func.name) {
            console.log(`Buscando definición completa para: ${func.name}`);
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

        console.log(`Funciones validadas (${validatedFunctions.length}):`, validatedFunctions);
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

    console.log("Agente encontrado:", agent.name);
    console.log("Funciones actuales:", agent.functions);

    // Actualizar los campos
    Object.keys(updateData).forEach((key) => {
      if (key === "functions") {
        console.log(`Actualizando funciones del agente ${id}:`, updateData.functions);
      }
      agent[key] = updateData[key];
    });

    console.log("Agente después de aplicar cambios (antes de guardar):");
    console.log("- Nombre:", agent.name);
    console.log("- Funciones:", agent.functions);

    // Guardar los cambios
    try {
      await agent.save();
      console.log(`Agente ${id} guardado con éxito`);
      console.log("Funciones guardadas:", agent.functions);
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
}

export default AgentRepository;
