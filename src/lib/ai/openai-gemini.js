import OpenAI from "openai";
import { getFunctionByName } from "@/lib/functions";

// Inicializar el cliente OpenAI con la configuración para Gemini
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

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
    "Always Use Chain of Draft reasoning inside <think> tags to solve problems. Always Start with a <script> XML tag followed by a brief outline of your approach - use concise steps (5-7 words per step) to frame your thinking. Then, expand on the most critical points with more detail, showing your reasoning process. Use line breaks between steps for clarity. After completing your reasoning with a </think> tag, provide your final, polished answer.\n\nExample:\n<think>\nStep 1: Identify problem type.\nStep 2: Consider relevant information.\nStep 3: Apply appropriate framework.\n\nFor step 1: This appears to be an optimization problem requiring trade-off analysis between multiple factors including cost, time, and resource allocation.\n\nFor step 3: Using constraint satisfaction approach because we need to balance competing requirements while maximizing overall utility.\n</think> [your final response]",
};

/**
 * Envía un mensaje de chat a Gemini 2.0 Flash y obtiene una respuesta sin streaming
 * @param {Array} messages - Array de objetos de mensaje con role and content
 * @param {Object} options - Opciones adicionales para la generación
 * @returns {Promise<string>} - La respuesta del modelo
 */
export async function chatWithGemini(messages, options = {}) {
  try {
    // Preparar las funciones para la API si se proporcionan
    const tools = prepareTools(options.functions);

    const response = await openai.chat.completions.create({
      model: options.model || "gemini-2.0-flash",
      messages: convertToOpenAIFormat(messages),
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.95,
      max_tokens: options.maxOutputTokens || 4096,
      tools: tools,
      tool_choice: tools && tools.length > 0 ? "auto" : undefined,
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
    // Preparar las funciones para la API si se proporcionan
    const tools = prepareTools(options.functions);

    console.log("Llamando a Gemini con funciones:", tools ? tools.length : 0);
    if (tools && tools.length > 0) {
      console.log("Herramientas preparadas:", JSON.stringify(tools, null, 2));
    }

    // Convertir mensajes al formato OpenAI
    const formattedMessages = convertToOpenAIFormat(messages);
    console.log("Mensajes formateados:", JSON.stringify(formattedMessages, null, 2));

    // Crear la solicitud
    const requestOptions = {
      model: options.model || "gemini-2.0-flash",
      messages: formattedMessages,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.95,
      max_tokens: options.maxOutputTokens || 4096,
      stream: true,
    };

    // Añadir herramientas si existen
    if (tools && tools.length > 0) {
      requestOptions.tools = tools;
      requestOptions.tool_choice = "auto";
    }

    console.log("Opciones de solicitud:", JSON.stringify(requestOptions, null, 2));

    try {
      const stream = await openai.chat.completions.create(requestOptions);

      return stream;
    } catch (error) {
      console.error("Error en la llamada a la API de Gemini:", error);

      // Extraer más información del error
      if (error.response) {
        console.error("Detalles de la respuesta de error:", {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        });
      }

      throw error;
    }
  } catch (error) {
    console.error("Error streaming chat with Gemini:", error);
    throw error;
  }
}

/**
 * Prepara las definiciones de funciones como herramientas para la API de OpenAI/Gemini
 * @param {Array} functionNames - Array de nombres de funciones
 * @returns {Array|undefined} - Array de herramientas o undefined si no hay funciones
 */
function prepareTools(functionNames) {
  if (!functionNames || !Array.isArray(functionNames) || functionNames.length === 0) {
    return undefined;
  }

  // Convertir los nombres de funciones a definiciones completas
  const tools = functionNames
    .map((funcName) => {
      // Si es un objeto con nombre, usamos el nombre
      const name = typeof funcName === "object" ? funcName.name : funcName;
      const functionDef = getFunctionByName(name);

      if (!functionDef) {
        console.warn(`Función no encontrada: ${name}`);
        return null;
      }

      // Devolver la definición en el formato esperado por Gemini (OpenAI compatibility)
      return {
        type: "function",
        function: {
          name: functionDef.name,
          description: functionDef.description,
          parameters: functionDef.parameters,
        },
      };
    })
    .filter(Boolean); // Eliminar funciones no encontradas

  return tools.length > 0 ? tools : undefined;
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

  // Always add the Markdown formatting system message if it doesn't already exist
  const hasMarkdownInstruction = formattedMessages.some(
    (msg) => msg.role === "system" && msg.content.includes("format your responses using Markdown")
  );

  if (!hasMarkdownInstruction) {
    formattedMessages.push(MARKDOWN_SYSTEM_MESSAGE);
  }

  // Always add the thinking process system message if it doesn't already exist
  const hasThinkingInstruction = formattedMessages.some(
    (msg) => msg.role === "system" && msg.content.includes("<think>")
  );

  if (!hasThinkingInstruction) {
    formattedMessages.push(THINKING_SYSTEM_MESSAGE);
  }

  // Luego añadimos el resto de mensajes
  otherMessages.forEach((msg) => {
    // Si es un mensaje de función, asegurarnos de que tenga el formato correcto
    if (msg.role === "function") {
      formattedMessages.push({
        role: "function",
        name: msg.name,
        content: msg.content,
      });
    }
    // Si es un mensaje de herramienta (tool)
    else if (msg.role === "tool") {
      formattedMessages.push({
        role: "tool",
        tool_call_id: msg.tool_call_id,
        content: msg.content,
      });
    }
    // Si es un mensaje del asistente con llamadas a herramientas
    else if (msg.role === "assistant" && msg.tool_calls) {
      formattedMessages.push({
        role: "assistant",
        content: msg.content,
        tool_calls: msg.tool_calls,
      });
    }
    // Cualquier otro tipo de mensaje
    else {
      formattedMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }
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
  let totalCompletionTokens = 0;
  let registeredInitialUsage = false;

  for await (const chunk of stream) {
    // Registrar una estimación inicial de uso al recibir el primer chunk
    if (!registeredInitialUsage) {
      // Registrar una estimación inicial mínima
      registeredInitialUsage = true;
      console.log("[Usage Tracker] Registrada estimación inicial al comenzar el stream");
    }

    const content = chunk.choices[0]?.delta?.content || "";
    fullText += content;

    // Estimación aproximada: cada token es aproximadamente 4 caracteres
    // Esta es una estimación muy cruda y debe ser refinada
    if (content) {
      totalCompletionTokens += Math.ceil(content.length / 4);
    }
  }

  // Registrar una estimación del uso
  // Nota: esto es una estimación muy aproximada
  const estimatedPromptTokens = Math.ceil(fullText.length / 8); // Esto es solo una estimación

  return fullText;
}

/**
 * Función helper para trabajar con streams en NextJS
 * @param {ReadableStream} stream - Stream de OpenAI
 * @returns {ReadableStream} - Stream compatible con NextJS
 */
export function createReadableStream(stream) {
  const encoder = new TextEncoder();
  let totalCompletionTokens = 0;
  let registeredInitialUsage = false;

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";

          // Registrar una estimación inicial de uso al recibir el primer chunk
          if (!registeredInitialUsage) {
            // Registrar una estimación inicial mínima
            registeredInitialUsage = true;
            console.log("[Usage Tracker] Registrada estimación inicial al comenzar el stream");
          }

          if (content) {
            controller.enqueue(encoder.encode(content));

            // Estimación aproximada: cada token es aproximadamente 4 caracteres
            totalCompletionTokens += Math.ceil(content.length / 4);
          }
        }

        // Registrar una estimación más precisa del uso al finalizar el stream
        const estimatedPromptTokens = Math.ceil(totalCompletionTokens * 0.8); // Esto es solo una estimación

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

/**
 * Procesa un stream de OpenAI y maneja las llamadas a funciones
 * @param {ReadableStream} stream - Stream de OpenAI
 * @param {Function} onContent - Callback para contenido normal
 * @param {Function} onFunctionCall - Callback para llamadas a funciones
 */
export async function processStreamWithFunctionCalls(stream, onContent, onFunctionCall) {
  let toolCallData = null;
  let totalCompletionTokens = 0;
  let registeredInitialUsage = false;

  try {
    for await (const chunk of stream) {
      console.log("Chunk recibido:", JSON.stringify(chunk, null, 2));

      // Registrar una estimación inicial de uso al recibir el primer chunk
      if (!registeredInitialUsage) {
        // Registrar una estimación inicial mínima
        registeredInitialUsage = true;
        console.log("[Usage Tracker] Registrada estimación inicial al comenzar el stream");
      }

      // Manejar contenido normal
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        onContent(content);
        // Estimación aproximada de tokens
        totalCompletionTokens += Math.ceil(content.length / 4);
      }

      // Detectar llamadas a herramientas (funciones)
      const toolCalls = chunk.choices[0]?.delta?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        console.log("Detectada llamada a herramienta:", JSON.stringify(toolCalls, null, 2));

        const toolCall = toolCalls[0];

        if (!toolCallData) {
          toolCallData = {
            id: toolCall.id || "",
            type: toolCall.type || "function",
            function: {
              name: toolCall.function?.name || "",
              arguments: toolCall.function?.arguments || "",
            },
          };
        } else {
          if (toolCall.function?.name) {
            toolCallData.function.name += toolCall.function.name;
          }

          if (toolCall.function?.arguments) {
            toolCallData.function.arguments += toolCall.function.arguments;
          }
        }
      }

      // Si es el último chunk y tenemos una llamada a función completa, procesarla
      if (chunk.choices[0]?.finish_reason === "tool_calls" && toolCallData) {
        console.log("Llamada a función completa:", JSON.stringify(toolCallData, null, 2));
        try {
          const args = JSON.parse(toolCallData.function.arguments);
          onFunctionCall(toolCallData.function.name, args);
        } catch (error) {
          console.error("Error parsing function arguments:", error);
          console.error("Raw arguments:", toolCallData.function.arguments);
        }
      }
    }
  } catch (error) {
    console.error("Error procesando stream con llamadas a funciones:", error);
    throw error;
  }
}
