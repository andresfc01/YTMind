import { NextResponse } from "next/server";
import { AgentRepository, DocumentRepository } from "@/lib/db/repositories";

/**
 * GET /api/agents/[id]/documents/[documentId]
 * Obtener un documento específico de un agente
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const documentId = params?.documentId;

    if (!id || !documentId) {
      return NextResponse.json({ error: "ID de agente o documento no válido" }, { status: 400 });
    }

    // Verificar que el agente existe
    const agent = await AgentRepository.findById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // Obtener el documento
    const document = await DocumentRepository.findById(documentId);
    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // Verificar que el documento pertenece al agente
    if (document.agentId.toString() !== id) {
      return NextResponse.json({ error: "El documento no pertenece al agente especificado" }, { status: 403 });
    }

    // Transformar el documento para la respuesta
    const documentData = {
      id: document._id.toString(),
      name: document.name,
      description: document.description,
      content: document.content,
      fileType: document.fileType,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };

    return NextResponse.json({ document: documentData });
  } catch (error) {
    console.error(`Error al obtener documento del agente:`, error);
    return NextResponse.json({ error: "Error al obtener documento del agente" }, { status: 500 });
  }
}

/**
 * DELETE /api/agents/[id]/documents/[documentId]
 * Eliminar un documento específico de un agente
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const documentId = params?.documentId;

    if (!id || !documentId) {
      return NextResponse.json({ error: "ID de agente o documento no válido" }, { status: 400 });
    }

    // Verificar que el agente existe
    const agent = await AgentRepository.findById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // Verificar que el documento existe
    const document = await DocumentRepository.findById(documentId);
    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // Verificar que el documento pertenece al agente
    if (document.agentId.toString() !== id) {
      return NextResponse.json({ error: "El documento no pertenece al agente especificado" }, { status: 403 });
    }

    // Eliminar el documento
    await DocumentRepository.delete(documentId);

    // Eliminar la referencia del documento en el agente
    await AgentRepository.removeDocument(id, documentId);

    return NextResponse.json({
      message: "Documento eliminado correctamente del agente",
    });
  } catch (error) {
    console.error(`Error al eliminar documento del agente:`, error);
    return NextResponse.json({ error: "Error al eliminar documento del agente" }, { status: 500 });
  }
}

/**
 * PUT /api/agents/[id]/documents/[documentId]
 * Actualizar un documento específico de un agente
 */
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const documentId = params?.documentId;

    if (!id || !documentId) {
      return NextResponse.json({ error: "ID de agente o documento no válido" }, { status: 400 });
    }

    // Verificar que el agente existe
    const agent = await AgentRepository.findById(id);
    if (!agent) {
      return NextResponse.json({ error: "Agente no encontrado" }, { status: 404 });
    }

    // Verificar que el documento existe
    const document = await DocumentRepository.findById(documentId);
    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // Verificar que el documento pertenece al agente
    if (document.agentId.toString() !== id) {
      return NextResponse.json({ error: "El documento no pertenece al agente especificado" }, { status: 403 });
    }

    // Extraer datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, description, content, fileType } = body;

    // Validación básica
    if (!name && !content && !description && !fileType) {
      return NextResponse.json({ error: "Se requiere al menos un campo para actualizar" }, { status: 400 });
    }

    // Preparar los datos para actualizar
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (content) updateData.content = content;
    if (fileType) updateData.fileType = fileType;

    // Actualizar el documento
    const updatedDocument = await DocumentRepository.update(documentId, updateData);

    return NextResponse.json({
      message: "Documento actualizado correctamente",
      document: {
        id: updatedDocument._id.toString(),
        name: updatedDocument.name,
        description: updatedDocument.description,
        fileType: updatedDocument.fileType,
        createdAt: updatedDocument.createdAt,
        updatedAt: updatedDocument.updatedAt,
        contentPreview: updatedDocument.content.substring(0, 100) + (updatedDocument.content.length > 100 ? "..." : ""),
      },
    });
  } catch (error) {
    console.error(`Error al actualizar documento del agente:`, error);
    return NextResponse.json({ error: "Error al actualizar documento del agente" }, { status: 500 });
  }
}
