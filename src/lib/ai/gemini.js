/**
 * Utilidades para interactuar con la API de Google Gemini
 */

/**
 * Función universal para hacer llamadas a la API de Gemini
 * @param {Object} options - Opciones para la llamada a la API
 * @param {Array} options.messages - Mensajes para el modelo en formato [{role: "user"|"assistant"|"system", content: "texto"}]
 * @param {string} options.model - Modelo de Gemini a utilizar (default: "gemini-1.0-pro")
 * @param {number} options.temperature - Temperatura para la generación (0-1, default: 0.7)
 * @param {number} options.maxTokens - Máximo de tokens en la respuesta (default: 800)
 * @param {boolean} options.streamResponse - Si la respuesta debe ser streaming (default: false)
 * @returns {Promise<string>} - Texto de la respuesta del modelo
 */
export async function generateGeminiResponse({
  messages,
  model = "gemini-2.0-flash-lite",
  temperature = 0.1,
  maxTokens = 8192,
}) {
  try {
    // Verificar que tenemos una API key configurada
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("No se ha configurado GEMINI_API_KEY en las variables de entorno");
    }

    // Convertir mensajes al formato esperado por Gemini
    const formattedMessages = formatMessagesForGemini(messages);

    // Construir la URL de la API de Gemini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // Construir el payload para la API
    const payload = {
      contents: formattedMessages,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      },
    };

    // Realizar la llamada a la API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API de Gemini: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Verificar que hay una respuesta
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      console.warn("La API de Gemini no devolvió contenido:", data);
      return "";
    }

    // Extraer el texto de la respuesta
    const responseText = data.candidates[0].content.parts[0].text;
    return responseText;
  } catch (error) {
    console.error("Error al generar respuesta con Gemini:", error);
    throw error;
  }
}

/**
 * Formatea los mensajes al formato esperado por la API de Gemini
 * @param {Array} messages - Mensajes en formato [{role: "user"|"assistant"|"system", content: "texto"}]
 * @returns {Array} - Mensajes formateados para Gemini
 */
function formatMessagesForGemini(messages) {
  // Crear un array para los mensajes formateados
  const formattedContents = [];

  // Extraer y agregar mensajes de sistema al primer mensaje de usuario
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const userAndAssistantMessages = messages.filter((msg) => msg.role !== "system");

  // Si no hay mensajes que no sean de sistema, devolver un mensaje de usuario vacío
  if (userAndAssistantMessages.length === 0) {
    return [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
    ];
  }

  // Procesar los mensajes en orden
  for (let i = 0; i < userAndAssistantMessages.length; i++) {
    const message = userAndAssistantMessages[i];
    let role = message.role === "assistant" ? "model" : "user";

    // Si es el primer mensaje de usuario y hay mensajes de sistema,
    // concatenarlos al principio del mensaje
    if (role === "user" && i === 0 && systemMessages.length > 0) {
      const systemContent = systemMessages.map((sys) => sys.content).join("\n\n");
      formattedContents.push({
        role: "user",
        parts: [{ text: `${systemContent}\n\n${message.content}` }],
      });
    } else {
      formattedContents.push({
        role: role,
        parts: [{ text: message.content }],
      });
    }
  }

  return formattedContents;
}

/**
 * Formatea transcripciones de YouTube para mejorar su legibilidad
 * @param {string} rawTranscription - Transcripción sin formato
 * @returns {Promise<string>} - Transcripción formateada
 */
export async function formatVideoTranscription(rawTranscription) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a professional transcript editor. Your task is to format the raw YouTube video transcript 
        provided by the user into a clean, properly punctuated and formatted version.
        
        Follow these instructions:
        1. Maintain the original language of the transcript (English, Spanish, etc.).
        2. Add proper capitalization, periods, commas, and other punctuation marks.
        3. Split the text into logical paragraphs.
        4. Fix obvious grammar issues but maintain the original meaning and style.
        5. Remove filler words and repeated phrases only if they don't add meaning.
        6. NEVER add any new content or interpretations not in the original transcript.
        7. NEVER translate the content to another language.
        8. Your response should ONLY be the formatted transcript with no explanations or additional text.
        
        This is critical for accessibility and searchability purposes.`,
      },
      {
        role: "user",
        content: rawTranscription,
      },
    ];

    // Usar un modelo más ligero y rápido para la formatación de texto
    const formattedTranscription = await generateGeminiResponse({
      messages,
      model: "gemini-2.0-flash-lite",
      temperature: 0.1, // Baja temperatura para mayor fidelidad al original
    });

    return formattedTranscription;
  } catch (error) {
    console.error("Error al formatear transcripción:", error);
    // En caso de error, devolver la transcripción original
    return rawTranscription;
  }
}
