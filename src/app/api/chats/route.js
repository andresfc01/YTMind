import { NextResponse } from "next/server";
import ChatRepository from "@/lib/db/repositories/ChatRepository";

/**
 * GET /api/chats
 * Obtener todos los chats
 */
export async function GET() {
  try {
    const chats = await ChatRepository.findAll();

    // Transformamos los datos para la respuesta
    const chatsData = chats.map((chat) => ({
      id: chat._id.toString(),
      title: chat.title,
      lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.substring(0, 50) : null,
      messagesCount: chat.messages.length,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));

    return NextResponse.json({ chats: chatsData });
  } catch (error) {
    console.error("Error al obtener chats:", error);
    return NextResponse.json({ error: "Error al obtener chats" }, { status: 500 });
  }
}

/**
 * POST /api/chats
 * Crear un nuevo chat
 */
export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    }

    // Validate messages array if provided
    if (data.messages && Array.isArray(data.messages)) {
      // Validate each message
      for (let i = 0; i < data.messages.length; i++) {
        const message = data.messages[i];

        // Ensure it's an object
        if (!message || typeof message !== "object") {
          return NextResponse.json({ error: `El mensaje ${i} debe ser un objeto válido` }, { status: 400 });
        }

        // Validate role
        if (
          !message.role ||
          typeof message.role !== "string" ||
          !["user", "assistant", "system", "function", "tool"].includes(message.role)
        ) {
          return NextResponse.json(
            { error: `El rol del mensaje ${i} debe ser uno de: user, assistant, system, function, tool` },
            { status: 400 }
          );
        }

        // Validate content
        if (message.content === undefined || message.content === null) {
          return NextResponse.json(
            { error: `El contenido del mensaje ${i} no puede ser nulo o indefinido` },
            { status: 400 }
          );
        }

        // Ensure content is a string
        message.content = String(message.content);

        // Add timestamp if not present
        if (!message.timestamp) {
          message.timestamp = new Date().toISOString();
        }
      }
    } else {
      // Initialize empty array if no messages provided
      data.messages = [];
    }

    const chat = await ChatRepository.create({
      title: data.title,
      messages: data.messages,
      model: data.model || "gemini-2.0-flash",
    });

    return NextResponse.json({
      message: "Chat creado correctamente",
      chat: {
        id: chat._id,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error al crear chat:", error);
    return NextResponse.json({ error: "Error al crear chat" }, { status: 500 });
  }
}
