import { NextResponse } from "next/server";
import { DocumentRepository } from "@/lib/db/repositories";

/**
 * GET /api/documents
 * Obtener todos los documentos o filtrar por agentId
 */
export async function GET(request) {
  try {
    // Verificamos si hay un parámetro de agentId en la URL
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    let documents;
    if (agentId) {
      documents = await DocumentRepository.findByAgentId(agentId);
    } else {
      documents = await DocumentRepository.findAll();
    }

    console.log(`Obtenidos ${documents.length} documentos de la base de datos`);

    // Transformamos los datos para la respuesta
    const documentsData = documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      fileType: doc.fileType,
      agentId: doc.agentId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      // No incluimos el contenido completo para reducir el tamaño de la respuesta
      contentPreview: doc.content.substring(0, 100) + (doc.content.length > 100 ? "..." : ""),
    }));

    return NextResponse.json({ documents: documentsData });
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return NextResponse.json({ error: "Error al obtener documentos" }, { status: 500 });
  }
}

/**
 * POST /api/documents
 * Crear un nuevo documento
 */
export async function POST(request) {
  try {
    // Extraer datos del cuerpo de la solicitud
    const body = await request.json();
    const { name, description, content, fileType, agentId } = body;

    // Validación básica
    if (!name || !content || !agentId) {
      return NextResponse.json(
        { error: "Se requieren name, content y agentId para crear un documento" },
        { status: 400 }
      );
    }

    // Crear el documento
    const documentData = {
      name,
      description: description || "",
      content,
      fileType: fileType || "text",
      agentId,
    };

    const document = await DocumentRepository.create(documentData);

    return NextResponse.json({
      message: "Documento creado correctamente",
      document: {
        id: document._id.toString(),
        name: document.name,
        description: document.description,
        fileType: document.fileType,
        agentId: document.agentId.toString(),
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error al crear documento:", error);
    return NextResponse.json({ error: "Error al crear documento" }, { status: 500 });
  }
}
