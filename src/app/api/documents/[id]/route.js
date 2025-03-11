import { NextResponse } from "next/server";
import { DocumentRepository } from "@/lib/db/repositories";

/**
 * GET /api/documents/[id]
 * Obtener un documento específico
 */
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de documento no válido" }, { status: 400 });
    }

    const document = await DocumentRepository.findById(id);

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // Transformamos para la respuesta
    const documentData = {
      id: document._id.toString(),
      name: document.name,
      description: document.description,
      content: document.content,
      fileType: document.fileType,
      agentId: document.agentId.toString(),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };

    return NextResponse.json({ document: documentData });
  } catch (error) {
    console.error(`Error al obtener documento:`, error);
    return NextResponse.json({ error: "Error al obtener documento" }, { status: 500 });
  }
}

/**
 * PUT /api/documents/[id]
 * Actualizar un documento existente
 */
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de documento no válido" }, { status: 400 });
    }

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
    const updatedDocument = await DocumentRepository.update(id, updateData);

    return NextResponse.json({
      message: "Documento actualizado correctamente",
      document: {
        id: updatedDocument._id.toString(),
        name: updatedDocument.name,
        description: updatedDocument.description,
        fileType: updatedDocument.fileType,
        agentId: updatedDocument.agentId.toString(),
        createdAt: updatedDocument.createdAt,
        updatedAt: updatedDocument.updatedAt,
        contentPreview: updatedDocument.content.substring(0, 100) + (updatedDocument.content.length > 100 ? "..." : ""),
      },
    });
  } catch (error) {
    console.error(`Error al actualizar documento:`, error);
    return NextResponse.json({ error: "Error al actualizar documento" }, { status: 500 });
  }
}

/**
 * DELETE /api/documents/[id]
 * Eliminar un documento
 */
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;

    if (!id) {
      return NextResponse.json({ error: "ID de documento no válido" }, { status: 400 });
    }

    await DocumentRepository.delete(id);

    return NextResponse.json({
      message: "Documento eliminado correctamente",
    });
  } catch (error) {
    console.error(`Error al eliminar documento:`, error);
    return NextResponse.json({ error: "Error al eliminar documento" }, { status: 500 });
  }
}
