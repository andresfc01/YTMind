/**
 * Registro de funciones disponibles para los agentes
 * Cada función debe tener:
 * - name: Nombre de la función
 * - description: Descripción de lo que hace
 * - parameters: Esquema JSON de los parámetros (puede estar vacío)
 * - implementation: La función que implementa la lógica
 */

import { getCurrentDate } from "./dateUtils";
import { getChannelInfo, analyzeComments, listChannelVideos } from "./youtubeAnalysis";
import { getVideoDetails } from "./getVideoDetails";

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
    implementation: getCurrentDate,
  },

  // Funciones de análisis de YouTube
  getChannelInfo: {
    name: "getChannelInfo",
    description:
      "Obtiene y analiza información detallada de un canal de YouTube. Funciona tanto con ID del canal como con username.",
    parameters: {
      type: "object",
      properties: {
        channelIdentifier: {
          type: "string",
          description: "ID del canal de YouTube o username del canal",
        },
      },
      required: ["channelIdentifier"],
    },
    implementation: getChannelInfo,
  },

  listChannelVideos: {
    name: "listChannelVideos",
    description:
      "Obtiene los 10 videos más populares de un canal de YouTube por número de vistas. Si includeShorts=false (por defecto), obtiene los 50 videos más populares del canal, filtra los Shorts, y devuelve los 10 más populares que no son Shorts.",
    parameters: {
      type: "object",
      properties: {
        channelIdentifier: {
          type: "string",
          description: "ID del canal de YouTube o username del canal",
        },
        includeShorts: {
          type: "boolean",
          description: "Si true, incluye Shorts en los resultados (por defecto false)",
          default: false,
        },
      },
      required: ["channelIdentifier"],
    },
    implementation: listChannelVideos,
  },

  getVideoDetails: {
    name: "getVideoDetails",
    description:
      "Obtiene información detallada de un video de YouTube, incluyendo estadísticas y opcionalmente su transcripción.",
    parameters: {
      type: "object",
      properties: {
        videoId: {
          type: "string",
          description: "ID del video de YouTube",
        },
        includeTranscript: {
          type: "boolean",
          description: "Si se debe incluir la transcripción en la respuesta (por defecto false)",
          default: false,
        },
      },
      required: ["videoId"],
    },
    implementation: getVideoDetails,
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
  const func = AVAILABLE_FUNCTIONS[name];

  if (func) {
    return func;
  } else {
    console.warn(`[Functions] ❌ Function "${name}" not found in registry`);
    return null;
  }
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
    console.error(`[Functions] ❌ Function "${name}" not found in AVAILABLE_FUNCTIONS registry`);
    throw new Error(`Función "${name}" no encontrada`);
  }

  try {
    // Validar parámetros requeridos
    if (func.parameters && func.parameters.required && Array.isArray(func.parameters.required)) {
      for (const reqParam of func.parameters.required) {
        if (params[reqParam] === undefined) {
          const error = `Parámetro requerido "${reqParam}" no proporcionado para la función "${name}"`;
          console.error(`[Functions] ${error}`);
          throw new Error(error);
        }
      }
    }

    // Usar implementation si existe, si no usar execute (para mantener compatibilidad)
    let result;
    if (typeof func.implementation === "function") {
      result = await func.implementation(params);
    } else if (typeof func.execute === "function") {
      result = await func.execute(params);
    } else {
      const error = `La función "${name}" no tiene un método de ejecución válido`;
      console.error(`[Functions] ${error}`);
      throw new Error(error);
    }

    return result;
  } catch (error) {
    console.error(`[Functions] Error executing function "${name}":`, error);
    // Devolver un objeto de error estructurado para mejor manejo
    return {
      error: true,
      message: error.message || `Error desconocido en la función "${name}"`,
      details: error.stack,
    };
  }
}

// Exportar todas las funciones
export {
  // Funciones de YouTube
  getChannelInfo,
  listChannelVideos,
  getVideoDetails,

  // Otras funciones aquí
};
