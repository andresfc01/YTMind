import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a Gemini model instance
 * @param {string} modelName - The model name to use (default: "gemini-2.0-flash")
 * @returns {GenerativeModel} - The model instance
 */
export function getModel(modelName = "gemini-2.0-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Send a chat message to Gemini and get a response
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} modelName - The model name to use (default: "gemini-2.0-flash")
 * @param {Object} options - Additional options for the generation
 * @returns {Promise<string>} - The model's response text
 */
export async function chatWithGemini(messages, modelName = "gemini-2.0-flash", options = {}) {
  try {
    const model = getModel(modelName);

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start a chat session
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
      generationConfig: {
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        maxOutputTokens: options.maxOutputTokens || 4096,
      },
    });

    // Send the last message and get response
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    return result.response.text();
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    throw error;
  }
}

/**
 * Stream a chat response from Gemini
 * @param {Array} messages - Array of message objects with role and content
 * @param {string} modelName - The model name to use (default: "gemini-2.0-flash")
 * @param {Object} options - Additional options for the generation
 * @returns {AsyncGenerator} - Async generator that yields response chunks
 */
export async function* streamChatWithGemini(messages, modelName = "gemini-2.0-flash", options = {}) {
  try {
    const model = getModel(modelName);

    // Convert messages to Gemini format
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start a chat session
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
      generationConfig: {
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        maxOutputTokens: options.maxOutputTokens || 4096,
      },
    });

    // Send the last message and stream response
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  } catch (error) {
    console.error("Error streaming chat with Gemini:", error);
    throw error;
  }
}
