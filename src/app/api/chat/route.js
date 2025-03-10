import { NextResponse } from "next/server";
import { streamChatWithGemini, createReadableStream } from "@/lib/ai/openai-gemini";

// Endpoint para streaming
export async function POST(request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Se requieren mensajes válidos" }, { status: 400 });
    }

    // Obtener el stream de Gemini
    const geminiStream = await streamChatWithGemini(messages);

    // Convertir a un stream compatible con NextJS
    const readableStream = createReadableStream(geminiStream);

    // Devolver el stream como respuesta
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error en el endpoint de chat:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
