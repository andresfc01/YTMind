import { NextResponse } from "next/server";
import { createClient, handleChatInteraction } from "@/lib/ai/chatService";
import { executeFunction } from "@/lib/functions";
import { getFunctionByName } from "@/lib/functions";

// Crear un cliente de OpenAI con la API de Gemini
const openAIClient = createClient({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Rate limiting and validation
const MAX_TOKENS = 4096;
const MIN_TOKENS = 1;

// Validar solicitud para chat
function validateChatRequest(req) {
  const {
    messages,
    temperature = 0.7,
    model = "gemini-2.0-flash",
    functions = [],
    contextGroups = [],
    images = [],
  } = req;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: "Se requiere al menos un mensaje" };
  }

  // Validar temperatura
  if (temperature < 0 || temperature > 1) {
    return { valid: false, error: "La temperatura debe estar entre 0 y 1" };
  }

  return { valid: true, messages, temperature, model, functions, contextGroups, images };
}

/**
 * Prepara las funciones disponibles como herramientas para OpenAI
 * @param {Array} functionNames - Lista de nombres de funciones a preparar
 * @returns {Array} Lista de herramientas en formato OpenAI
 */
function prepareFunctionsAsTools(functionNames) {
  if (!functionNames || !Array.isArray(functionNames) || functionNames.length === 0) {
    return [];
  }

  // Convertir los nombres de funciones a definiciones completas
  return functionNames
    .map((funcName) => {
      // Obtener la definición de la función
      const name = typeof funcName === "object" ? funcName.name : funcName;
      const functionDef = getFunctionByName(name);

      if (!functionDef) {
        console.warn(`Función no encontrada: ${name}`);
        return null;
      }

      // Crear la herramienta en formato OpenAI
      return {
        type: "function",
        function: {
          name: functionDef.name,
          description: functionDef.description,
          parameters: functionDef.parameters,
        },
      };
    })
    .filter(Boolean); // Filtrar cualquier null
}

/**
 * Crea un mapa de funciones para ser ejecutadas
 * @param {Array} functionNames - Nombres de las funciones
 * @returns {Object} Mapa de nombre de función a su implementación
 */
function createFunctionMap(functionNames) {
  const functionMap = {};

  functionNames.forEach((funcName) => {
    const name = typeof funcName === "object" ? funcName.name : funcName;
    functionMap[name] = (args) => executeFunction(name, args);
  });

  return functionMap;
}

// API Handler para solicitudes de chat
export async function POST(request) {
  try {
    // Obtener y validar los datos del cuerpo de la solicitud
    const requestData = await request.json();

    const { valid, error, messages, temperature, model, functions, contextGroups, images } =
      validateChatRequest(requestData);

    if (!valid) {
      console.error("Solicitud inválida:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log(
      `Chat API received ${messages.length} messages, ${contextGroups?.length || 0} context groups, and ${
        images?.length || 0
      } images`
    );

    // Process images if they exist
    let processedMessages = [...messages];
    if (images && images.length > 0) {
      console.log(`Processing ${images.length} images`);

      // Find the last user message to attach images to
      const lastUserMessageIndex = processedMessages.findLastIndex((msg) => msg.role === "user");

      if (lastUserMessageIndex !== -1) {
        // Convert the message to the OpenAI format with content array
        const lastUserMessage = processedMessages[lastUserMessageIndex];
        const newUserMessage = {
          role: "user",
          content: [],
        };

        // Add the text content first
        if (lastUserMessage.content) {
          newUserMessage.content.push({
            type: "text",
            text: lastUserMessage.content,
          });
        }

        // Add each image
        for (const imageData of images) {
          try {
            // Convert image data to base64 (assuming imageData.file is already a base64 string)
            const base64Image = imageData.base64 || imageData.data;

            if (base64Image) {
              newUserMessage.content.push({
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              });
            }
          } catch (err) {
            console.error("Error processing image:", err);
          }
        }

        // Replace the original message with the new one containing images
        processedMessages[lastUserMessageIndex] = newUserMessage;
      }
    }

    // Crear herramientas desde las funciones
    const tools = prepareFunctionsAsTools(functions);

    // Crear el mapa de funciones para ejecución
    const toolMap = createFunctionMap(functions);

    // Opciones para mensajes de sistema predefinidos
    const useMarkdown = requestData.useMarkdown !== false; // Por defecto es true
    const useThinking = requestData.useThinking !== false; // Por defecto es true

    // Use processed messages with images for the chat interaction
    const stream = await handleChatInteraction({
      client: openAIClient,
      messages: processedMessages,
      contextGroups,
      tools,
      toolMap,
      model: model, // Use vision model if images are present
      useMarkdown,
      useThinking,
      debug: false,
      onToolExecution: (name, args) => {
        console.log(`Ejecutando herramienta ${name} con argumentos:`, JSON.stringify(args));
      },
      onToolResult: (name, result) => {
        console.log(
          `Resultado de herramienta ${name}:`,
          typeof result === "object" ? JSON.stringify(result).substring(0, 100) + "..." : result
        );
      },
    });

    // Transformar el stream para NextResponse
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          try {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch (e) {
            console.error("Error al procesar chunk:", e);
          }
        }
        controller.close();
      },
    });

    return new NextResponse(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud: " + error.message,
        response: "Lo siento, ocurrió un error al procesar tu solicitud.",
      },
      { status: 500 }
    );
  }
}
