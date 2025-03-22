import { NextResponse } from "next/server";
import ChatRepository from "@/lib/db/repositories/ChatRepository";

/**
 * POST /api/chats/[id]/messages
 * Añadir un mensaje a un chat existente
 */
export async function POST(request, context) {
  try {
    // In Next.js 14+, params is a Promise that must be awaited
    const params = await context.params;
    const id = params?.id;

    // Validate chat ID
    if (!id || id === "null" || id === "undefined") {
      return NextResponse.json({ error: "ID de chat inválido" }, { status: 400 });
    }

    // Parse and validate the message
    const data = await request.json();
    const message = data.message || data;

    // Ensure message has required fields
    if (!message || typeof message !== "object") {
      return NextResponse.json({ error: "El mensaje debe ser un objeto válido" }, { status: 400 });
    }

    // Validate role
    if (
      !message.role ||
      typeof message.role !== "string" ||
      !["user", "assistant", "system", "function", "tool"].includes(message.role)
    ) {
      return NextResponse.json(
        { error: "El rol del mensaje debe ser uno de: user, assistant, system, function, tool" },
        { status: 400 }
      );
    }

    // Validate content
    if (message.content === undefined || message.content === null) {
      return NextResponse.json({ error: "El contenido del mensaje no puede ser nulo o indefinido" }, { status: 400 });
    }

    // Ensure content is a string
    message.content = String(message.content);

    // Add timestamp if not present
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }

    // Add message to chat
    const result = await ChatRepository.addMessage(id, message);

    return NextResponse.json({ message: "Mensaje añadido correctamente", result });
  } catch (error) {
    console.error("Error al añadir mensaje a chat:", error);
    return NextResponse.json({ error: "Error al añadir mensaje" }, { status: 500 });
  }
}
