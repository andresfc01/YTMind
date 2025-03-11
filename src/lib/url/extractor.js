/**
 * Utilidad para extraer contenido de URLs
 */

import { JSDOM } from "jsdom";

/**
 * Extrae el contenido útil de una URL
 * @param {string} url - URL de la página web
 * @returns {Promise<string>} - Contenido extraído
 */
export async function extractContentFromUrl(url) {
  try {
    console.log(`Extrayendo contenido de URL: ${url}`);

    // Verificar si es una URL de sitio con restricciones conocidas
    const restrictedSites = checkRestrictedSite(url);
    if (restrictedSites) {
      return restrictedSites;
    }

    // Hacer la petición a la URL con headers más completos para simular un navegador
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
    });

    if (!response.ok) {
      // En lugar de fallar, devolvemos un contenido predeterminado
      console.warn(`No se pudo acceder a la URL (${response.status}): ${url}`);
      return generateDefaultContent(url, response.status);
    }

    const html = await response.text();

    // Analizar el HTML usando JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extraer el contenido principal
    let content = extractMainContent(document);

    // Si no se encontró contenido principal, extraer todo el texto del body
    if (!content || content.trim().length < 100) {
      content = document.body.textContent || "";

      // Limpiar el contenido
      content = cleanContent(content);
    }

    console.log(`Contenido extraído: ${content.length} caracteres`);

    return content;
  } catch (error) {
    console.error("Error extracting content from URL:", error);
    // En lugar de propagar el error, devolvemos un contenido alternativo
    return generateDefaultContent(url, "error");
  }
}

/**
 * Verifica si la URL pertenece a un sitio con restricciones conocidas
 * @param {string} url - URL a verificar
 * @returns {string|null} - Contenido predeterminado o null
 */
function checkRestrictedSite(url) {
  try {
    const urlObj = new URL(url);

    // Detectar sitios de redes sociales específicos
    if (urlObj.hostname === "twitter.com" || urlObj.hostname === "x.com") {
      // Extraer información básica de la URL de Twitter/X
      const pathParts = urlObj.pathname.split("/");
      const username = pathParts[1];
      const tweetId = pathParts[3];

      return (
        `Esta URL es de Twitter/X y contiene un tweet de @${username}.\n\n` +
        `La URL completa es: ${url}\n\n` +
        `Debido a las restricciones de Twitter/X, no se puede extraer el contenido completo automáticamente. ` +
        `El contenido podría incluir texto, imágenes, videos o enlaces compartidos por el usuario.\n\n` +
        `ID del Tweet: ${tweetId}`
      );
    }

    // Detectar otras plataformas con restricciones
    if (
      urlObj.hostname.includes("facebook.com") ||
      urlObj.hostname.includes("instagram.com") ||
      urlObj.hostname.includes("threads.net")
    ) {
      return (
        `Esta URL es de ${urlObj.hostname} y puede contener un post, imagen o video.\n\n` +
        `La URL completa es: ${url}\n\n` +
        `Debido a las restricciones de esta plataforma, no se puede extraer el contenido completo automáticamente.`
      );
    }

    // LinkedIn
    if (urlObj.hostname.includes("linkedin.com")) {
      return (
        `Esta URL es de LinkedIn y puede contener un perfil, publicación o artículo.\n\n` +
        `La URL completa es: ${url}\n\n` +
        `Debido a las restricciones de LinkedIn, no se puede extraer el contenido completo automáticamente.`
      );
    }

    return null;
  } catch (error) {
    console.error("Error checking restricted site:", error);
    return null;
  }
}

/**
 * Genera un contenido predeterminado cuando no se puede acceder a la URL
 * @param {string} url - URL original
 * @param {string|number} errorCode - Código de error o mensaje
 * @returns {string} - Contenido predeterminado
 */
function generateDefaultContent(url, errorCode) {
  return (
    `No se pudo extraer el contenido de la URL: ${url}\n\n` +
    `Error: ${errorCode}\n\n` +
    `Esta URL podría requerir autenticación, tener restricciones de acceso, o no estar disponible actualmente. ` +
    `El agente intentará usar la información disponible en la URL misma para proporcionar contexto, ` +
    `pero podría no tener acceso al contenido completo.`
  );
}

/**
 * Extrae el contenido principal de la página
 * @param {Document} document - Documento DOM
 * @returns {string} - Contenido principal
 */
function extractMainContent(document) {
  // Intenta encontrar el contenido principal usando selectores comunes
  const mainSelectors = [
    "main",
    "article",
    '[role="main"]',
    "#content",
    ".content",
    "#main",
    ".main",
    ".post",
    ".article",
  ];

  let mainElement = null;

  // Intentar cada selector hasta encontrar uno válido
  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent && element.textContent.trim().length > 100) {
      mainElement = element;
      break;
    }
  }

  // Si no se encontró un elemento principal, intentar identificar el que tiene más texto
  if (!mainElement) {
    const elements = Array.from(document.querySelectorAll("div, section"));
    let maxLength = 0;

    elements.forEach((element) => {
      const text = element.textContent || "";
      if (text.length > maxLength && text.length > 200) {
        maxLength = text.length;
        mainElement = element;
      }
    });
  }

  // Extraer y limpiar el texto
  if (mainElement) {
    // Eliminar elementos no deseados del contenido principal
    const elementsToRemove = mainElement.querySelectorAll(
      "nav, header, footer, aside, script, style, .ads, .comments, .nav, .menu, .sidebar"
    );
    elementsToRemove.forEach((el) => el.remove());

    let content = "";

    // Extraer párrafos y encabezados
    const elements = mainElement.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li");
    elements.forEach((el) => {
      const tagName = el.tagName.toLowerCase();
      const text = el.textContent.trim();

      if (text.length > 0) {
        if (tagName.startsWith("h")) {
          content += `\n## ${text}\n\n`;
        } else {
          content += `${text}\n\n`;
        }
      }
    });

    return cleanContent(content);
  }

  return null;
}

/**
 * Limpia el contenido extraído
 * @param {string} content - Contenido a limpiar
 * @returns {string} - Contenido limpio
 */
function cleanContent(content) {
  // Reemplazar múltiples espacios en blanco con uno solo
  let cleaned = content.replace(/\s+/g, " ");

  // Reemplazar múltiples saltos de línea con dos
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Eliminar espacios al inicio y final
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Formatea el contenido para uso en el contexto
 * @param {Object} url - Objeto URL de la base de datos
 * @returns {string} - Contenido formateado
 */
export function formatUrlForContext(url) {
  return `<url>
<link>${url.url}</link>
<content>${url.content}</content>
</url>

`;
}
