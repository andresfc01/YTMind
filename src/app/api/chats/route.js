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
    const body = await request.json();
    const { title, messages, model } = body;

    if (!title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    }

    const newChat = await ChatRepository.create({
      title,
      messages: messages || [],
      model,
    });

    return NextResponse.json(
      {
        chat: {
          id: newChat._id.toString(),
          title: newChat.title,
          messagesCount: newChat.messages.length,
          createdAt: newChat.createdAt,
          updatedAt: newChat.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear chat:", error);
    return NextResponse.json({ error: "Error al crear chat" }, { status: 500 });
  }
}
