import React, { useState } from "react";

/**
 * Componente de formulario simplificado para subir documentos
 */
export default function DocumentForm({ agentId, onSubmit, onCancel }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError(""); // Limpiar cualquier error previo
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);

    try {
      // Determinar el tipo de archivo
      let fileType = "text";
      if (file.type.includes("markdown") || file.name.endsWith(".md")) {
        fileType = "markdown";
      } else if (file.type.includes("pdf")) {
        fileType = "pdf";
      } else if (file.type.includes("json") || file.name.endsWith(".json")) {
        fileType = "json";
      }

      let content;
      // Leer el contenido del archivo
      if (fileType === "pdf") {
        // Para PDFs, solo guardamos el nombre del archivo
        content = `PDF file: ${file.name}`;
      } else {
        content = await readFileContent(file);
      }

      // Prepara los datos simplificados para enviar
      const documentData = {
        name: file.name, // Usar el nombre del archivo como nombre del documento
        description: `Uploaded on ${new Date().toLocaleString()}`, // Descripción automática
        content,
        fileType,
        agentId,
      };

      await onSubmit(documentData);
    } catch (error) {
      console.error("Error submitting document:", error);
      setError("An error occurred while uploading the file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-white">
        <input
          type="file"
          id="fileUpload"
          onChange={handleFileChange}
          className="w-full text-gray-700"
          accept=".txt,.md,.markdown,.json,.pdf"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">Supported formats: .txt, .md, .markdown, .json, .pdf</p>
      </div>

      {error && <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md">{error}</div>}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !file}
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </form>
  );
}
