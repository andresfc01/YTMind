/**
 * Registro de funciones disponibles para los agentes
 * Cada función debe tener:
 * - name: Nombre de la función
 * - description: Descripción de lo que hace
 * - parameters: Esquema JSON de los parámetros (puede estar vacío)
 * - execute: La función que implementa la lógica
 */

import { getCurrentDate } from "./dateUtils";

// Definición de las funciones disponibles
export const AVAILABLE_FUNCTIONS = {
  // Función para obtener la fecha actual
  getCurrentDate: {
    name: "getCurrentDate",
    description: "Obtiene la fecha y hora actual en formato legible",
    parameters: {
      type: "object",
      properties: {
        format: {
          type: "string",
          description: "Formato de la fecha (short, medium, long)",
          enum: ["short", "medium", "long"],
        },
      },
      required: [],
    },
    execute: getCurrentDate,
  },
};

/**
 * Obtener todas las funciones disponibles
 * @returns {Array} Array de definiciones de funciones
 */
export function getAllFunctions() {
  return Object.values(AVAILABLE_FUNCTIONS);
}

/**
 * Obtener una función por su nombre
 * @param {string} name Nombre de la función
 * @returns {Object|null} Definición de la función o null si no existe
 */
export function getFunctionByName(name) {
  return AVAILABLE_FUNCTIONS[name] || null;
}

/**
 * Ejecutar una función por su nombre con los parámetros dados
 * @param {string} name Nombre de la función
 * @param {Object} params Parámetros para la función
 * @returns {Promise<any>} Resultado de la ejecución
 */
export async function executeFunction(name, params = {}) {
  const func = getFunctionByName(name);
  if (!func) {
    throw new Error(`Función "${name}" no encontrada`);
  }

  try {
    return await func.execute(params);
  } catch (error) {
    console.error(`Error ejecutando función "${name}":`, error);
    throw error;
  }
}
