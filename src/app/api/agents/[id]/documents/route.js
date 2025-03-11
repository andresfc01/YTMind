import { NextResponse } from "next/server";
import { AgentRepository, DocumentRepository } from "@/lib/db/repositories";

/**
 * GET /api/agents/[id]/documents
 * Obtener los documentos de un agente específico
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    // Verificar que el agente existe
    const agent = await AgentRepository.findById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // Obtener los documentos asociados al agente
    const documents = await DocumentRepository.findByAgentId(id);

    // Transformar los documentos para la respuesta
    const documentsData = documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      fileType: doc.fileType,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      contentPreview: doc.content.substring(0, 100) + (doc.content.length > 100 ? "..." : ""),
    }));

    return NextResponse.json({ documents: documentsData });
  } catch (error) {
    console.error(`Error al obtener documentos del agente:`, error);
    return NextResponse.json({ error: "Error al obtener documentos del agente" }, { status: 500 });
  }
}

/**
 * POST /api/agents/[id]/documents
 * Añadir un documento a un agente
 */
export async function POST(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de agente no válido" }, { status: 400 });
    }

    // Verificar que el agente existe
    const agent = await AgentRepository.findById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // Extraer datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, description, content, fileType } = body;

    // Validación básica
    if (!name || !content) {
      return NextResponse.json({ error: "Se requieren name y content para crear un documento" }, { status: 400 });
    }

    // Crear el documento
    const documentData = {
      name,
      description: description || "",
      content,
      fileType: fileType || "text",
      agentId: id,
    };

    const document = await DocumentRepository.create(documentData);

    // Añadir el documento al agente
    await AgentRepository.addDocument(id, document._id);

    return NextResponse.json({
      message: "Documento añadido correctamente al agente",
      document: {
        id: document._id.toString(),
        name: document.name,
        description: document.description,
        fileType: document.fileType,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error(`Error al añadir documento al agente:`, error);
    return NextResponse.json({ error: "Error al añadir documento al agente" }, { status: 500 });
  }
}
