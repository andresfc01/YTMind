import { NextResponse } from "next/server";
import AgentRepository from "@/lib/db/repositories/AgentRepository";
import UrlRepository from "@/lib/db/repositories/UrlRepository";
import { extractContentFromUrl } from "@/lib/url/extractor";

/**
 * GET /api/agents/[id]/urls/[urlId]
 * Obtiene una URL específica de un agente
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const urlId = params?.urlId;

    // Verificar si el agente existe
    try {
      await AgentRepository.findById(id);
    } catch (error) {
      return NextResponse.json({ error: `Agente no encontrado: ${error.message}` }, { status: 404 });
    }

    // Obtener la URL
    try {
      const url = await UrlRepository.findById(urlId);

      // Verificar que la URL pertenezca al agente
      if (url.agentId.toString() !== id) {
        return NextResponse.json({ error: "La URL no pertenece a este agente" }, { status: 403 });
      }

      return NextResponse.json({
        url: {
          id: url._id.toString(),
          url: url.url,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: `URL no encontrada: ${error.message}` }, { status: 404 });
    }
  } catch (error) {
    console.error("Error obteniendo URL:", error);
    return NextResponse.json({ error: `Error obteniendo URL: ${error.message}` }, { status: 500 });
  }
}

/**
 * PUT /api/agents/[id]/urls/[urlId]
 * Actualiza una URL específica de un agente
 */
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const urlId = params?.urlId;
    const body = await request.json();

    // Validar el cuerpo de la solicitud
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Verificar si el agente existe
    try {
      await AgentRepository.findById(id);
    } catch (error) {
      return NextResponse.json({ error: `Agente no encontrado: ${error.message}` }, { status: 404 });
    }

    // Verificar si la URL existe y pertenece al agente
    let url;
    try {
      url = await UrlRepository.findById(urlId);

      if (url.agentId.toString() !== id) {
        return NextResponse.json({ error: "La URL no pertenece a este agente" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: `URL no encontrada: ${error.message}` }, { status: 404 });
    }

    // Preparar datos para actualizar - Solo actualizar la URL y su contenido si es necesario
    const updateData = {};

    // Solo si la URL ha cambiado, actualizarla y extraer contenido nuevo
    if (body.url !== url.url) {
      updateData.url = body.url;

      // Extraer el contenido nuevo
      try {
        updateData.content = await extractContentFromUrl(body.url);
      } catch (error) {
        return NextResponse.json({ error: `Error extrayendo contenido de la URL: ${error.message}` }, { status: 400 });
      }
    }

    // Si no hay nada que actualizar, devolver la URL sin cambios
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        url: {
          id: url._id.toString(),
          url: url.url,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
      });
    }

    // Actualizar la URL
    console.log(`Actualizando URL ${urlId} con datos:`, JSON.stringify(updateData));
    const updatedUrl = await UrlRepository.update(urlId, updateData);

    return NextResponse.json({
      url: {
        id: updatedUrl._id.toString(),
        url: updatedUrl.url,
        createdAt: updatedUrl.createdAt,
        updatedAt: updatedUrl.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error actualizando URL:", error);
    return NextResponse.json(
      {
        error: `Error actualizando URL: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents/[id]/urls/[urlId]
 * Elimina una URL específica de un agente
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const urlId = params?.urlId;

    // Verificar si el agente existe
    try {
      await AgentRepository.findById(id);
    } catch (error) {
      return NextResponse.json({ error: `Agente no encontrado: ${error.message}` }, { status: 404 });
    }

    // Verificar si la URL existe y pertenece al agente
    try {
      const url = await UrlRepository.findById(urlId);

      if (url.agentId.toString() !== id) {
        return NextResponse.json({ error: "La URL no pertenece a este agente" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: `URL no encontrada: ${error.message}` }, { status: 404 });
    }

    // Eliminar la URL
    await UrlRepository.delete(urlId);

    // Eliminar la referencia de la URL en el agente
    await AgentRepository.removeUrl(id, urlId);

    return NextResponse.json({
      success: true,
      message: "URL eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando URL:", error);
    return NextResponse.json({ error: `Error eliminando URL: ${error.message}` }, { status: 500 });
  }
}
