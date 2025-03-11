import { NextResponse } from "next/server";
import AgentRepository from "@/lib/db/repositories/AgentRepository";
import UrlRepository from "@/lib/db/repositories/UrlRepository";
import { extractContentFromUrl } from "@/lib/url/extractor";

/**
 * GET /api/agents/[id]/urls
 * Obtiene todas las URLs de un agente
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    // Verificar si el agente existe
    try {
      await AgentRepository.findById(id);
    } catch (error) {
      return NextResponse.json({ error: `Agente no encontrado: ${error.message}` }, { status: 404 });
    }

    // Obtener las URLs
    const urls = await UrlRepository.findByAgentId(id);

    // Formatear las URLs para la respuesta
    const formattedUrls = urls.map((url) => ({
      id: url._id.toString(),
      url: url.url,
      createdAt: url.createdAt,
      updatedAt: url.updatedAt,
    }));

    return NextResponse.json({ urls: formattedUrls });
  } catch (error) {
    console.error("Error obteniendo URLs:", error);
    return NextResponse.json({ error: `Error obteniendo URLs: ${error.message}` }, { status: 500 });
  }
}

/**
 * POST /api/agents/[id]/urls
 * Añade una nueva URL a un agente
 */
export async function POST(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
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

    // Extraer el contenido de la URL
    let content;
    try {
      content = await extractContentFromUrl(body.url);
    } catch (error) {
      return NextResponse.json({ error: `Error extrayendo contenido de la URL: ${error.message}` }, { status: 400 });
    }

    // Crear la URL - Asegurarnos de usar solo los campos permitidos por el esquema
    const urlData = {
      agentId: id,
      url: body.url,
      content,
    };

    console.log("Creando URL con datos:", JSON.stringify(urlData));
    const url = await UrlRepository.create(urlData);

    // Añadir la referencia de la URL al agente
    await AgentRepository.addUrl(id, url._id);

    return NextResponse.json(
      {
        url: {
          id: url._id.toString(),
          url: url.url,
          createdAt: url.createdAt,
          updatedAt: url.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error añadiendo URL:", error);
    return NextResponse.json(
      {
        error: `Error añadiendo URL: ${error.message}`,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: error.errors
          ? Object.keys(error.errors)
              .map((key) => `${key}: ${error.errors[key].message}`)
              .join(", ")
          : undefined,
      },
      { status: 500 }
    );
  }
}
