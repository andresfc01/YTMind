import { NextResponse } from "next/server";
import ChatRepository from "@/lib/db/repositories/ChatRepository";

/**
 * POST /api/chats/[id]/messages
 * Añadir un mensaje a un chat existente
 */
export async function POST(request, context) {
  try {
    // En Next.js 14, params es una Promesa que debe ser esperada
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de chat no válido" }, { status: 400 });
    }

    const body = await request.json();
    const { role, content } = body;

    if (!role || !content) {
      return NextResponse.json({ error: "El rol y el contenido son requeridos" }, { status: 400 });
    }

    if (role !== "user" && role !== "assistant" && role !== "system") {
      return NextResponse.json({ error: 'El rol debe ser "user", "assistant" o "system"' }, { status: 400 });
    }

    const message = {
      role,
      content,
      timestamp: new Date(),
    };

    const updatedChat = await ChatRepository.addMessage(id, message);

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Mensaje añadido correctamente",
      chat: updatedChat,
    });
  } catch (error) {
    console.error(`Error al añadir mensaje al chat:`, error);
    return NextResponse.json({ error: "Error al añadir mensaje" }, { status: 500 });
  }
}
