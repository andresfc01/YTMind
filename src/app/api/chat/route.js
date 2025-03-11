import { NextResponse } from "next/server";
import { streamChatWithGemini, createReadableStream, processStreamWithFunctionCalls } from "@/lib/ai/openai-gemini";
import { executeFunction, getFunctionByName } from "@/lib/functions";
import { AgentRepository, DocumentRepository } from "@/lib/db/repositories";
import UrlRepository from "@/lib/db/repositories/UrlRepository";

/**
 * Determina la relevancia de los documentos para la consulta actual
 * @param {Array} documents - Lista de documentos disponibles
 * @param {Array} messages - Mensajes de la conversación
 * @returns {Array} - Documentos ordenados por relevancia
 */
function rankDocumentsByRelevance(documents, messages) {
  // En una implementación más avanzada, aquí utilizaríamos embeddings y
  // cálculos de similitud para determinar la relevancia.
  // Para esta versión simplificada, usamos un enfoque básico:

  // Obtener el último mensaje del usuario
  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user");
  if (!lastUserMessage) return documents;

  const query = lastUserMessage.content.toLowerCase();

  // Convertir los documentos a objetos planos para asegurar que podemos acceder a sus propiedades
  const plainDocuments = documents.map((doc) => {
    // Si el documento es un objeto Mongoose, lo convertimos a un objeto simple
    if (doc.toObject) {
      return doc.toObject();
    } else if (doc._doc) {
      return { ...doc._doc };
    } else {
      // Si ya es un objeto simple, lo usamos directamente
      return { ...doc };
    }
  });

  // Asignar una puntuación de relevancia a cada documento
  const scoredDocuments = plainDocuments.map((doc) => {
    let score = 0;

    // Asegurarnos de que name y content estén definidos
    const docName = doc.name || "Sin nombre";
    const docContent = doc.content || "";

    // Comprobar si el título contiene palabras de la consulta
    const titleMatches = query
      .split(/\s+/)
      .filter((word) => word.length > 3 && docName.toLowerCase().includes(word)).length;
    score += titleMatches * 3; // Mayor peso al título

    // Comprobar si el contenido contiene palabras de la consulta
    const contentMatches = query
      .split(/\s+/)
      .filter((word) => word.length > 3 && docContent.toLowerCase().includes(word)).length;
    score += contentMatches;

    // Dar un pequeño impulso a documentos más recientes
    const docCreatedAt = doc.createdAt || new Date();
    const ageInDays = (new Date() - new Date(docCreatedAt)) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - ageInDays / 7); // Hasta 5 puntos extra si es de la última semana

    return {
      ...doc,
      relevanceScore: score,
    };
  });

  // Ordenar por puntuación de relevancia (mayor primero)
  return scoredDocuments.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Determina la relevancia de las URLs para la consulta actual
 * @param {Array} urls - Lista de URLs disponibles
 * @param {Array} messages - Mensajes de la conversación
 * @returns {Array} - URLs ordenadas por relevancia
 */
function rankUrlsByRelevance(urls, messages) {
  // Obtener el último mensaje del usuario
  const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user");
  if (!lastUserMessage) return urls;

  const query = lastUserMessage.content.toLowerCase();

  // Convertir las URLs a objetos planos
  const plainUrls = urls.map((url) => {
    if (url.toObject) {
      return url.toObject();
    } else if (url._doc) {
      return { ...url._doc };
    } else {
      return { ...url };
    }
  });

  // Asignar una puntuación de relevancia a cada URL
  const scoredUrls = plainUrls.map((url) => {
    let score = 0;

    // Asegurarnos de que url y content estén definidos
    const urlPath = url.url || "";
    const urlContent = url.content || "";

    // Comprobar si la URL contiene palabras de la consulta
    const urlMatches = query
      .split(/\s+/)
      .filter((word) => word.length > 3 && urlPath.toLowerCase().includes(word)).length;
    score += urlMatches * 3; // Mayor peso a la URL

    // Comprobar si el contenido contiene palabras de la consulta
    const contentMatches = query
      .split(/\s+/)
      .filter((word) => word.length > 3 && urlContent.toLowerCase().includes(word)).length;
    score += contentMatches;

    // Dar un pequeño impulso a URLs más recientes
    const urlCreatedAt = url.createdAt || new Date();
    const ageInDays = (new Date() - new Date(urlCreatedAt)) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - ageInDays / 7); // Hasta 5 puntos extra si es de la última semana

    return {
      ...url,
      relevanceScore: score,
    };
  });

  // Ordenar por puntuación de relevancia (mayor primero)
  return scoredUrls.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Endpoint para streaming
export async function POST(request) {
  try {
    const body = await request.json();
    const { messages, temperature = 0.7, model = "gemini-2.0-flash", agentId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Se requieren mensajes válidos" }, { status: 400 });
    }

    // Preparar mensajes modificados (posiblemente incluyendo documentos)
    let modifiedMessages = [...messages];

    // Si se proporciona un agentId, obtener las funciones y documentos del agente
    let agentFunctions = [];
    if (agentId) {
      try {
        const agent = await AgentRepository.findById(agentId);
        if (agent) {
          // Obtener funciones del agente
          if (agent.functions) {
            agentFunctions = agent.functions;
            console.log(`Usando funciones del agente ${agent.name}:`, agentFunctions);
          }

          // Crear un mensaje de contexto para documentos y URLs
          let contextMessage = "Use the following context information to answer the user's questions:\n\n";

          // Límite de tamaño de contexto para evitar exceder el tamaño máximo de ventana de contexto
          let totalContextSize = 0;
          const MAX_CONTEXT_SIZE = 100000; // Aproximadamente 25,000 caracteres para dejar espacio para otras partes del mensaje

          // Obtener documentos del agente
          const documents = await DocumentRepository.findByAgentId(agentId);
          if (documents && documents.length > 0) {
            console.log(`Agregando ${documents.length} documentos como contexto para el agente ${agent.name}`);

            // Ordenar documentos por relevancia para la consulta actual
            const rankedDocuments = rankDocumentsByRelevance(documents, modifiedMessages);

            // Procesar documentos ordenados por relevancia
            for (const doc of rankedDocuments) {
              // Verificar que el documento tenga nombre y contenido definidos
              const docName = doc.name || "Untitled Document";
              const docContent = doc.content || "No content";

              // Crear el contenido del documento con formato XML
              const documentContent = `<document>\n<title>${docName}</title>\n<content>${docContent}</content>\n</document>\n\n`;
              const contentSize = documentContent.length;

              if (totalContextSize + contentSize <= MAX_CONTEXT_SIZE) {
                contextMessage += documentContent;
                totalContextSize += contentSize;
              } else {
                // Si no podemos añadir el documento completo, añadimos una nota
                console.log(`Document "${docName}" excluded or truncated due to size limitations`);

                // Si el primer documento ya es demasiado grande, lo truncamos
                if (totalContextSize === 0) {
                  const truncatedContent = docContent.substring(0, MAX_CONTEXT_SIZE - 200);
                  contextMessage += `<document>\n<title>${docName}</title>\n<content>${truncatedContent}...(truncated)</content>\n</document>\n\n`;
                  totalContextSize = contextMessage.length;
                  break; // Solo incluimos este documento truncado
                }

                // Si ya hemos añadido al menos un documento, paramos aquí
                break;
              }
            }
          }

          // Obtener URLs del agente
          const urls = await UrlRepository.findByAgentId(agentId);
          if (urls && urls.length > 0) {
            console.log(`Agregando ${urls.length} URLs como contexto para el agente ${agent.name}`);

            // Ordenar URLs por relevancia para la consulta actual
            const rankedUrls = rankUrlsByRelevance(urls, modifiedMessages);

            // Procesar URLs ordenadas por relevancia
            for (const url of rankedUrls) {
              // Verificar que la URL tenga contenido definido
              const urlPath = url.url || "https://example.com";
              const urlContent = url.content || "No content";

              // Crear el contenido de la URL con formato XML
              const urlXmlContent = `<url>\n<link>${urlPath}</link>\n<content>${urlContent}</content>\n</url>\n\n`;
              const contentSize = urlXmlContent.length;

              if (totalContextSize + contentSize <= MAX_CONTEXT_SIZE) {
                contextMessage += urlXmlContent;
                totalContextSize += contentSize;
              } else {
                // Si no podemos añadir la URL completa, añadimos una nota
                console.log(`URL "${urlPath}" excluded or truncated due to size limitations`);

                // Si no hay contexto todavía, truncamos el contenido de la primera URL
                if (totalContextSize === 0) {
                  const truncatedContent = urlContent.substring(0, MAX_CONTEXT_SIZE - 200);
                  contextMessage += `<url>\n<link>${urlPath}</link>\n<content>${truncatedContent}...(truncated)</content>\n</url>\n\n`;
                  totalContextSize = contextMessage.length;
                  break; // Solo incluimos esta URL truncada
                }

                // Si ya hemos añadido al menos una URL, paramos aquí
                break;
              }
            }
          }

          // Añadir instrucciones finales solo si se agregó algún contexto
          if (totalContextSize > 0) {
            contextMessage +=
              "When answering questions, use this contextual information if it's relevant to the query. You are an assistant for generating YouTube content that uses this information as reference and context.";

            // Añadir mensaje de contexto al inicio de los mensajes
            modifiedMessages.unshift({
              role: "system",
              content: contextMessage,
            });
          }
        }
      } catch (error) {
        console.error(`Error al obtener datos del agente ${agentId}:`, error);
      }
    }

    // Verificar si la solicitud es para streaming normal o para manejo de funciones
    const handleFunctions = body.handleFunctions === true;

    if (handleFunctions) {
      // Manejo de funciones con respuesta no streaming
      return handleFunctionCalls(modifiedMessages, temperature, model, agentFunctions);
    } else {
      // Streaming normal
      // Obtener el stream de Gemini con los parámetros del agente
      const geminiStream = await streamChatWithGemini(modifiedMessages, {
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
