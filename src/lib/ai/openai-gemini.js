import OpenAI from "openai";

// Inicializar el cliente OpenAI con la configuración para Gemini
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

/**
 * Envía un mensaje de chat a Gemini 2.0 Flash y obtiene una respuesta sin streaming
 * @param {Array} messages - Array de objetos de mensaje con role and content
 * @param {Object} options - Opciones adicionales para la generación
 * @returns {Promise<string>} - La respuesta del modelo
 */
export async function chatWithGemini(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: convertToOpenAIFormat(messages),
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.95,
      max_tokens: options.maxOutputTokens || 4096,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    throw error;
  }
}

/**
 * Envía un mensaje de chat a Gemini 2.0 Flash y obtiene una respuesta en streaming
 * @param {Array} messages - Array de objetos de mensaje con role and content
 * @param {Object} options - Opciones adicionales para la generación
 * @returns {ReadableStream} - Stream con la respuesta del modelo
 */
export async function streamChatWithGemini(messages, options = {}) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: convertToOpenAIFormat(messages),
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.95,
      max_tokens: options.maxOutputTokens || 4096,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error("Error streaming chat with Gemini:", error);
    throw error;
  }
}

/**
 * Convierte mensajes del formato de la aplicación al formato OpenAI
 * @param {Array} messages - Array de objetos de mensaje en formato de la aplicación
 * @returns {Array} - Array de objetos de mensaje en formato OpenAI
 */
function convertToOpenAIFormat(messages) {
  // Filtramos los mensajes de tipo system y los agregamos correctamente
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const otherMessages = messages.filter((msg) => msg.role !== "system");

  // Si hay mensajes de sistema, crearlos como instrucciones de sistema
  let formattedMessages = [];

  // Primero añadimos mensajes de sistema como mensajes del sistema
  if (systemMessages.length > 0) {
    // En el formato de OpenAI, los mensajes de sistema van primero
    systemMessages.forEach((msg) => {
      formattedMessages.push({
        role: "system",
        content: msg.content,
      });
    });
  }

  // Luego añadimos el resto de mensajes
  otherMessages.forEach((msg) => {
    formattedMessages.push({
      role: msg.role,
      content: msg.content,
    });
  });

  return formattedMessages;
}

/**
 * Procesa un stream de OpenAI y devuelve texto completo
 * @param {ReadableStream} stream - Stream de OpenAI
 * @returns {Promise<string>} - Texto completo
 */
export async function processStreamToText(stream) {
  let fullText = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    fullText += content;
  }

  return fullText;
}

/**
 * Función helper para trabajar con streams en NextJS
 * @param {ReadableStream} stream - Stream de OpenAI
 * @returns {ReadableStream} - Stream compatible con NextJS
 */
export function createReadableStream(stream) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
