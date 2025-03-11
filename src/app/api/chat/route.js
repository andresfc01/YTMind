import { NextResponse } from "next/server";
import { streamChatWithGemini, createReadableStream, processStreamWithFunctionCalls } from "@/lib/ai/openai-gemini";
import { executeFunction, getFunctionByName } from "@/lib/functions";
import { AgentRepository } from "@/lib/db/repositories";

// Endpoint para streaming
export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, temperature = 0.7, model = "gemini-2.0-flash", agentId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Se requieren mensajes válidos" }, { status: 400 });
    }

    // Si se proporciona un agentId, obtener las funciones del agente
    let agentFunctions = [];
    if (agentId) {
      try {
        const agent = await AgentRepository.findById(agentId);
        if (agent && agent.functions) {
          agentFunctions = agent.functions;
          console.log(`Usando funciones del agente ${agent.name}:`, agentFunctions);
        }
      } catch (error) {
        console.error(`Error al obtener funciones del agente ${agentId}:`, error);
      }
    }

    // Verificar si la solicitud es para streaming normal o para manejo de funciones
    const handleFunctions = body.handleFunctions === true;

    if (handleFunctions) {
      // Manejo de funciones con respuesta no streaming
      return handleFunctionCalls(messages, temperature, model, agentFunctions);
    } else {
      // Streaming normal
      // Obtener el stream de Gemini con los parámetros del agente
      const geminiStream = await streamChatWithGemini(messages, {
        temperature,
        model,
        functions: agentFunctions,
      });

      // Convertir a un stream compatible con NextJS
      const readableStream = createReadableStream(geminiStream);

      // Devolver el stream como respuesta
      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      });
    }
  } catch (error) {
    console.error("Error en el endpoint de chat:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}

/**
 * Maneja las llamadas a funciones del modelo
 * @param {Array} messages - Mensajes de la conversación
 * @param {number} temperature - Temperatura para la generación
 * @param {string} model - Modelo a utilizar
 * @param {Array} functions - Funciones disponibles
 * @returns {Promise<Response>} - Respuesta con el resultado
 */
async function handleFunctionCalls(messages, temperature, model, functions) {
  try {
    // Crear un objeto para almacenar la respuesta parcial
    let responseContent = "";
    let functionCallDetected = false;
    let functionName = "";
    let functionArgs = {};

    // Obtener el stream de Gemini
    const geminiStream = await streamChatWithGemini(messages, {
      temperature,
      model,
      functions,
    });

    // Procesar el stream y detectar llamadas a funciones
    await processStreamWithFunctionCalls(
      geminiStream,
      // Callback para contenido normal
      (content) => {
        responseContent += content;
      },
      // Callback para llamadas a funciones
      (name, args) => {
        functionCallDetected = true;
        functionName = name;
        functionArgs = args;
      }
    );

    // Si se detectó una llamada a función, ejecutarla
    if (functionCallDetected) {
      console.log(`Ejecutando función: ${functionName} con argumentos:`, functionArgs);

      try {
        // Ejecutar la función
        const functionResult = await executeFunction(functionName, functionArgs);
        console.log("Resultado de la función:", functionResult);

        // En lugar de hacer una segunda llamada a la API, generamos una respuesta directamente
        // basada en el resultado de la función
        let finalResponse = "";

        // Formatear la respuesta según el tipo de función
        if (functionName === "getCurrentDate") {
          finalResponse = `Hoy es ${functionResult.date} a las ${functionResult.time}.`;
        } else {
          // Para otras funciones, devolver un mensaje genérico con el resultado
          finalResponse = `He obtenido la siguiente información: ${JSON.stringify(functionResult)}`;
        }

        // Devolver la respuesta final
        return NextResponse.json({
          response: finalResponse,
          functionCall: {
            name: functionName,
            arguments: functionArgs,
            result: functionResult,
          },
        });
      } catch (error) {
        console.error(`Error al ejecutar la función ${functionName}:`, error);
        return NextResponse.json(
          {
            error: `Error al ejecutar la función: ${error.message}`,
            functionCall: {
              name: functionName,
              arguments: functionArgs,
            },
          },
          { status: 500 }
        );
      }
    } else {
      // Si no hay llamada a función, devolver el contenido normal
      return NextResponse.json({
        response: responseContent,
      });
    }
  } catch (error) {
    console.error("Error al manejar llamadas a funciones:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
