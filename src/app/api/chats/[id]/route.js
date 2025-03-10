import { NextResponse } from "next/server";
import ChatRepository from "@/lib/db/repositories/ChatRepository";

/**
 * GET /api/chats/[id]
 * Obtener un chat específico
 */
export async function GET(request, context) {
  try {
    // En Next.js 14, params es una Promesa que debe ser esperada
    const params = await context.params;
    console.log("Params después de await:", params);

    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de chat no válido" }, { status: 400 });
    }

    const chat = await ChatRepository.findById(id);

    if (!chat) {
      return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error(`Error al obtener chat:`, error);
    return NextResponse.json({ error: "Error al obtener chat" }, { status: 500 });
  }
}

/**
 * PUT /api/chats/[id]
 * Actualizar un chat específico
 */
export async function PUT(request, context) {
  try {
    // En Next.js 14, params es una Promesa que debe ser esperada
    const params = await context.params;
    console.log("Params después de await:", params);

    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de chat no válido" }, { status: 400 });
    }

    const body = await request.json();
    const { title, messages } = body;

    const updateData = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (messages !== undefined) {
      updateData.messages = messages;
    }

    const updatedChat = await ChatRepository.update(id, updateData);

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error(`Error al actualizar chat:`, error);
    return NextResponse.json({ error: "Error al actualizar chat" }, { status: 500 });
  }
}

/**
 * DELETE /api/chats/[id]
 * Eliminar un chat específico
 */
export async function DELETE(request, context) {
  try {
    // En Next.js 14, params es una Promesa que debe ser esperada
    const params = await context.params;
    console.log("Params después de await:", params);

    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de chat no válido" }, { status: 400 });
    }

    const result = await ChatRepository.delete(id);

    if (!result) {
      return NextResponse.json({ error: "Chat no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error(`Error al eliminar chat:`, error);
    return NextResponse.json({ error: "Error al eliminar chat" }, { status: 500 });
  }
}
