import DocumentRepository from "@/lib/db/repositories/DocumentRepository";
import UrlRepository from "@/lib/db/repositories/UrlRepository";
import AgentRepository from "@/lib/db/repositories/AgentRepository";
import { formatUrlForContext } from "@/lib/url/extractor";

/**
 * Construye el contexto de un agente a partir de sus documentos y URLs
 * @param {string} agentId - ID del agente
 * @returns {Promise<string>} - Contexto construido
 */
export async function buildAgentContext(agentId) {
  try {
    console.log(`Construyendo contexto para el agente ${agentId}`);

    // Obtener documentos
    const documentIds = await AgentRepository.getDocumentIds(agentId);
    const documents = [];

    for (const docId of documentIds) {
      try {
        const doc = await DocumentRepository.findById(docId);
        if (doc) {
          documents.push(doc);
        }
      } catch (error) {
        console.warn(`Error obteniendo documento ${docId}:`, error.message);
      }
    }

    // Obtener URLs
    const urlIds = await AgentRepository.getUrlIds(agentId);
    const urls = [];

    for (const urlId of urlIds) {
      try {
        const url = await UrlRepository.findById(urlId);
        if (url) {
          urls.push(url);
        }
      } catch (error) {
        console.warn(`Error obteniendo URL ${urlId}:`, error.message);
      }
    }

    // Si no hay documentos ni URLs, retornar un contexto vacío
    if (documents.length === 0 && urls.length === 0) {
      return "";
    }

    // Construir contexto
    let context = "Use the following context information to answer the user's questions:\n\n";

    // Controlar el tamaño máximo del contexto
    const MAX_CONTEXT_SIZE = 25000;
    let totalContextSize = context.length;

    // Añadir documentos al contexto con etiquetas XML
    for (const doc of documents) {
      const docName = doc.name || "Untitled Document";
      const docContent = doc.content || "No content";

      const documentContent = `<document>\n<title>${docName}</title>\n<content>${docContent}</content>\n</document>\n\n`;
      const contentSize = documentContent.length;

      if (totalContextSize + contentSize <= MAX_CONTEXT_SIZE) {
        context += documentContent;
        totalContextSize += contentSize;
      } else {
        // Si el primer documento es demasiado grande, truncarlo
        if (totalContextSize === context.length) {
          const truncatedContent = docContent.substring(0, MAX_CONTEXT_SIZE - 200 - context.length - docName.length);
          context += `<document>\n<title>${docName}</title>\n<content>${truncatedContent}...(truncated)</content>\n</document>\n\n`;
          break;
        }
        break;
      }
    }

    // Añadir URLs al contexto
    for (const url of urls) {
      const urlContent = formatUrlForContext(url);
      const contentSize = urlContent.length;

      if (totalContextSize + contentSize <= MAX_CONTEXT_SIZE) {
        context += urlContent;
        totalContextSize += contentSize;
      } else {
        // Si ya hemos añadido al menos un documento o URL, parar aquí
        if (totalContextSize > context.length) {
          break;
        }

        // Si no hay nada de contexto aún, truncar el contenido de la primera URL
        const urlPlain = url.url || "https://example.com";
        const contentPlain = url.content || "No content";
        const truncatedContent = contentPlain.substring(0, MAX_CONTEXT_SIZE - 200 - context.length - urlPlain.length);

        context += `<url>\n<link>${urlPlain}</link>\n<content>${truncatedContent}...(truncated)</content>\n</url>\n\n`;
        break;
      }
    }

    // Añadir instrucciones finales
    context +=
      "When answering questions, use this contextual information if it's relevant to the query. You are an assistant that uses this information as reference and context.";

    console.log(`Contexto construido: ${context.length} caracteres`);

    return context;
  } catch (error) {
    console.error("Error construyendo contexto del agente:", error);
    return "";
  }
}
