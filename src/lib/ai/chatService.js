import OpenAI from "openai";

// Default system message for Markdown formatting
const MARKDOWN_SYSTEM_MESSAGE = {
  role: "system",
  content:
    "When appropriate and relevant, format your responses using Markdown to enhance readability. Use headers, lists, code blocks, bold, italic, and other Markdown formatting features to structure your responses and make information easier to understand. However, only use formatting when it adds value to the response.",
};

// Default system message for step-by-step thinking with XML tags
const THINKING_SYSTEM_MESSAGE = {
  role: "system",
  content:
    "Always Use Chain of Draft reasoning inside <think> tags to solve problems. Always Start with a <script> XML tag followed by a brief outline of your approach - use concise steps (5-7 words per step) to frame your thinking.",
};

/**
 * Crea un cliente de OpenAI con la configuración proporcionada
 * @param {Object} config - Configuración para el cliente OpenAI
 * @param {string} config.apiKey - API Key de OpenAI
 * @param {string} [config.baseURL] - URL base opcional (útil para Gemini u otros proveedores)
 * @returns {OpenAI} Cliente OpenAI configurado
 */
export function createClient(config) {
  return new OpenAI(config);
}

/**
 * Añade mensajes de sistema predefinidos para mejorar la calidad de respuestas
 * @param {Array} messages - Array de mensajes originales
 * @param {Object} options - Opciones adicionales
 * @returns {Array} - Mensajes con los mensajes de sistema añadidos
 */
function addSystemMessages(messages, options = {}) {
  const { useMarkdown = true, useThinking = true } = options;

  // Crear copia de los mensajes para no modificar el original
  const enhancedMessages = [...messages];

  // Verificar si ya existen mensajes de sistema
  const hasMarkdownMessage = messages.some(
    (m) => m.role === "system" && m.content.includes("format your responses using Markdown")
  );

  const hasThinkingMessage = messages.some((m) => m.role === "system" && m.content.includes("<think>"));

  // Añadir solo los mensajes que no existen ya
  if (useMarkdown && !hasMarkdownMessage) {
    enhancedMessages.unshift(MARKDOWN_SYSTEM_MESSAGE);
  }

  if (useThinking && !hasThinkingMessage) {
    enhancedMessages.unshift(THINKING_SYSTEM_MESSAGE);
  }

  return enhancedMessages;
}

/**
 * Maneja una interacción de chat que puede usar herramientas y devuelve un stream
 *
 * @param {Object} options - Opciones para la interacción
 * @param {OpenAI} options.client - Cliente OpenAI ya configurado
 * @param {Array} options.messages - Historial de mensajes del chat
 * @param {Array} [options.tools] - Herramientas disponibles para el modelo
 * @param {Object} [options.toolMap] - Mapa de funciones para ejecutar herramientas {nombreHerramienta: función}
 * @param {string} [options.model="gemini-2.0-flash"] - Modelo a utilizar
 * @param {function} [options.onToolExecution] - Callback al ejecutar una herramienta (recibe nombre y argumentos)
 * @param {function} [options.onToolResult] - Callback al recibir resultado de una herramienta
 * @param {boolean} [options.debug=false] - Activar mensajes de depuración
 * @param {boolean} [options.useMarkdown=true] - Añadir mensaje de sistema para formateo Markdown
 * @param {boolean} [options.useThinking=true] - Añadir mensaje de sistema para Chain of Thought
 * @returns {Promise<AsyncGenerator>} Stream de respuesta para procesar token a token
 */
export async function handleChatInteraction(options) {
  const {
    client,
    messages,
    tools = [],
    toolMap = {},
    model = "gemini-2.0-flash",
    onToolExecution,
    onToolResult,
    debug = false,
    useMarkdown = true,
    useThinking = true,
  } = options;

  // Añadir mensajes de sistema predefinidos si no están ya presentes
  const enhancedMessages = addSystemMessages(messages, { useMarkdown, useThinking });

  const initialResponse = await client.chat.completions.create({
    model,
    messages: enhancedMessages,
    tools: tools.length > 0 ? tools : undefined,
    tool_choice: tools.length > 0 ? "auto" : undefined,
    stream: false,
    temperature: 0.1, // Baja temperatura para decisiones
  });

  // Revisar si la respuesta contiene etiquetas think
  const initialContent = initialResponse.choices[0]?.message?.content || "";
  if (initialContent) {
    // Si contiene la etiqueta, mostramos el contexto
    if (initialContent.includes("<think>")) {
      const thinkPos = initialContent.indexOf("<think>");
      const startContext = Math.max(0, thinkPos - 20);
      const endContext = Math.min(initialContent.length, thinkPos + 30);
    }
  }

  const assistantMessage = initialResponse.choices[0].message;

  // Si hay llamadas a herramientas, procesarlas antes de devolver el stream final
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    if (debug) console.log("Detectadas llamadas a herramientas");

    // Crea una copia de los mensajes para no modificar el original
    const updatedMessages = [...enhancedMessages, assistantMessage];

    // Procesar cada llamada a herramienta
    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type === "function") {
        const functionName = toolCall.function.name;
        let functionArgs = {};

        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          if (debug) console.error("Error analizando argumentos:", e);
          continue;
        }

        // Notificar que estamos ejecutando una herramienta
        if (onToolExecution) {
          onToolExecution(functionName, functionArgs);
        }

        // Verificar si tenemos la función en el mapa de herramientas
        if (toolMap[functionName]) {
          try {
            // Ejecutar la función con los argumentos
            const functionResult = await toolMap[functionName](functionArgs);

            // Notificar sobre el resultado
            if (onToolResult) {
              onToolResult(functionName, functionResult);
            }

            // Añadir el resultado a los mensajes
            updatedMessages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(functionResult),
            });
          } catch (error) {
            if (debug) console.error(`Error ejecutando herramienta ${functionName}:`, error);
          }
        } else if (debug) {
          console.warn(`No se encontró implementación para la herramienta ${functionName}`);
        }
      }
    }

    // Ahora obtener la respuesta final con streaming
    try {
      return client.chat.completions.create({
        model,
        messages: updatedMessages,
        stream: true,
      });
    } catch (error) {
      if (debug) console.error("Error al crear stream final:", error);

      // Si falla el streaming, intentar sin streaming como fallback
      const fallbackResponse = await client.chat.completions.create({
        model,
        messages: updatedMessages,
        stream: false,
      });

      // Convertir la respuesta no-streaming en un generador asíncrono para mantener la interfaz consistente
      async function* createFallbackStream() {
        yield {
          choices: [
            {
              delta: {
                content: fallbackResponse.choices[0].message.content,
              },
            },
          ],
        };
      }

      return createFallbackStream();
    }
  } else {
    // No hay llamadas a herramientas, devolver stream directamente
    // Pero en este caso no incluimos el mensaje del asistente que ya tenemos, para evitar duplicación
    try {
      return client.chat.completions.create({
        model,
        messages: enhancedMessages,
        stream: true,
      });
    } catch (error) {
      if (debug) console.error("Error al crear stream directo:", error);

      // Fallback a respuesta no-streaming (ya la tenemos)
      async function* createDirectFallbackStream() {
        yield {
          choices: [
            {
              delta: {
                content: assistantMessage.content,
              },
            },
          ],
        };
      }

      return createDirectFallbackStream();
    }
  }
}
