import OpenAI from "openai";

// Unified system message combining formatting and thinking instructions
const UNIFIED_SYSTEM_MESSAGE = {
  role: "system",
  content: `You are an AI assistant that helps with YouTube content analysis and management.

When solving problems, use Chain of Draft reasoning inside <think> tags. Start with a <script> XML tag followed by a brief outline of your approach - use concise steps (5-7 words per step) to frame your thinking.

Format your responses using Markdown to enhance readability. Use headers, lists, code blocks, bold, italic, and other Markdown formatting features when it adds value to the response.

Be direct, concise, and helpful in your answers.`,
};

/**
 * Creates a system message with full context information
 * @param {Array} contextGroups - Array of context groups with their items
 * @returns {Object} System message with formatted context
 */
export function createContextSystemMessage(contextGroups) {
  if (!contextGroups || contextGroups.length === 0) {
    return null;
  }

  let content = "Below is context information that you can reference in your response when relevant.\n\n";

  // Process each context group and format it with XML tags
  contextGroups.forEach((group) => {
    content += `<context-group id="${group._id}" name="${group.name}">\n`;

    // Add group description if available
    if (group.description) {
      content += `<description>${group.description}</description>\n`;
    }

    // Add metadata if available
    if (group.metadata) {
      content += `<metadata>${JSON.stringify(group.metadata)}</metadata>\n`;
    }

    // Add items if available
    if (group.items && group.items.length > 0) {
      content += `<items>\n`;
      group.items.forEach((item) => {
        content += `<item type="${item.type}" id="${item.id}">\n`;

        // Formato específico según el tipo de elemento
        if (item.type === "video" && item.details) {
          content += `  <title>${item.details.title || "Untitled"}</title>\n`;
          if (item.details.description) content += `  <description>${item.details.description}</description>\n`;
          if (item.details.channelTitle) content += `  <channel>${item.details.channelTitle}</channel>\n`;
          if (item.details.transcript) content += `  <transcript>${item.details.transcript}</transcript>\n`;
        } else if (item.type === "channel" && item.details) {
          content += `  <title>${item.details.title || "Untitled Channel"}</title>\n`;
          if (item.details.description) content += `  <description>${item.details.description}</description>\n`;
        } else if (item.type === "document" && item.details) {
          content += `  <title>${item.details.title || "Untitled Document"}</title>\n`;
          if (item.details.content) content += `  <content>${item.details.content}</content>\n`;
        } else if (item.type === "url" && item.details) {
          content += `  <title>${item.details.title || "Untitled URL"}</title>\n`;
          if (item.details.url) content += `  <url>${item.details.url}</url>\n`;
          if (item.details.content) content += `  <content>${item.details.content}</content>\n`;
        }
        // Incluir datos completos como respaldo
        content += `  <raw_data>${JSON.stringify(item.details || {})}</raw_data>\n`;

        content += `</item>\n`;
      });
      content += `</items>\n`;
    }

    content += `</context-group>\n\n`;
  });

  content +=
    "NOTE: Only use this context information when it is relevant to answering the user's question. If the user mentions a specific context group or its content, refer to that information in your response. Otherwise, you can respond without reference to the context.";

  return {
    role: "system",
    content,
  };
}

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
 * Construye un mensaje de sistema unificado basado en las opciones activadas
 * @param {Object} options - Opciones para la construcción del mensaje
 * @returns {Object} Mensaje de sistema unificado
 */
function buildSystemMessage(options = {}) {
  const { useMarkdown = true, useThinking = true } = options;
  let content = "You are an AI assistant that helps with YouTube content analysis and management.\n\n";

  if (useThinking) {
    content +=
      "When solving problems, use Chain of Draft reasoning inside <think> tags. Always start with a <think> XML tag followed by a brief outline of your approach - use concise steps (5-7 words per step) to frame your thinking.\n\n" +
      "For example:\n" +
      "<think>\n" +
      "1. Understand the YouTube analysis request\n" +
      "2. Identify key metrics needed\n" +
      "3. Analyze channel performance data\n" +
      "4. Compare with industry benchmarks\n" +
      "5. Provide actionable recommendations\n" +
      "</think>\n\n";
  }

  if (useMarkdown) {
    content +=
      "Format your responses using Markdown to enhance readability. Use headers, lists, code blocks, bold, italic, and other Markdown formatting features when it adds value to the response.\n\n";
  }

  content += "Be direct, concise, and helpful in your answers.";

  return {
    role: "system",
    content,
  };
}

/**
 * Añade mensajes de sistema predefinidos para mejorar la calidad de respuestas
 * @param {Array} messages - Array de mensajes originales
 * @param {Object} options - Opciones adicionales
 * @returns {Array} - Mensajes con los mensajes de sistema añadidos
 */
function addSystemMessages(messages, options = {}) {
  const { useMarkdown = true, useThinking = true, contextGroups = [] } = options;

  // Crear copia de los mensajes para no modificar el original
  const enhancedMessages = [...messages];

  // Verificar si ya existen mensajes de sistema
  const hasSystemMessage = messages.some((m) => m.role === "system");

  const hasContextMessage = messages.some(
    (m) => (m.role === "system" || m.role === "user") && m.content.includes("<context-group")
  );

  // Añadir mensaje de sistema unificado si no existe ya uno
  if (!hasSystemMessage) {
    const systemMessage = buildSystemMessage({ useMarkdown, useThinking });
    enhancedMessages.unshift(systemMessage);
  }

  // Añadir mensaje de contexto como 'user' si hay grupos y no existe ya un mensaje similar
  if (contextGroups.length > 0 && !hasContextMessage) {
    const contextContent = createContextSystemMessage(contextGroups);
    if (contextContent) {
      // Convertir a mensaje de usuario y añadirlo después de los mensajes del sistema
      const contextUserMessage = {
        role: "user",
        content: contextContent.content,
      };

      // Encuentra la posición después del último mensaje de sistema
      let lastSystemIndex = -1;
      for (let i = 0; i < enhancedMessages.length; i++) {
        if (enhancedMessages[i].role === "system") {
          lastSystemIndex = i;
        }
      }

      // Insertar después del último mensaje de sistema o al principio si no hay
      if (lastSystemIndex >= 0) {
        enhancedMessages.splice(lastSystemIndex + 1, 0, contextUserMessage);
      } else {
        enhancedMessages.unshift(contextUserMessage);
      }
    }
  }

  return enhancedMessages;
}

/**
 * Maneja una interacción de chat que puede usar herramientas y devuelve un stream
 *
 * @param {Object} options - Opciones para la interacción
 * @param {OpenAI} options.client - Cliente OpenAI ya configurado
 * @param {Array} options.messages - Historial de mensajes del chat
 * @param {Array} [options.contextGroups=[]] - Grupos de contexto a incluir en el mensaje de sistema
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
    contextGroups = [],
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
  const enhancedMessages = addSystemMessages(messages, { useMarkdown, useThinking, contextGroups });

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
  if (initialContent && initialContent.includes("<think>") && debug) {
    const thinkPos = initialContent.indexOf("<think>");
    const startContext = Math.max(0, thinkPos - 20);
    const endContext = Math.min(initialContent.length, thinkPos + 30);
  }

  const assistantMessage = initialResponse.choices[0].message;

  // Si hay llamadas a herramientas, procesarlas antes de devolver el stream final
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
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
