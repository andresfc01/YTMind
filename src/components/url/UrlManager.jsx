import React, { useState, useEffect } from "react";
import UrlModal from "./UrlModal";

/**
 * Componente para la gestión de URLs de un agente
 */
export default function UrlManager({ agentId }) {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // Cargar URLs al montar el componente o cuando cambia el agentId
  useEffect(() => {
    if (agentId) {
      fetchUrls();
    }
  }, [agentId]);

  const fetchUrls = async () => {
    if (!agentId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/agents/${agentId}/urls`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUrls(data.urls || []);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      setError("Failed to load URLs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = () => {
    setModalOpen(true);
  };

  const handleDeleteUrl = (url) => {
    setDeleteConfirmation(url);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/urls/${deleteConfirmation.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Eliminar la URL de la lista local
      setUrls((prev) => prev.filter((url) => url.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);
    } catch (error) {
      console.error("Error deleting URL:", error);
      setError("Failed to delete URL. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleSubmitUrl = async (formData) => {
    try {
      // Crear nueva URL
      const response = await fetch(`/api/agents/${agentId}/urls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Actualizar la lista de URLs
      setUrls((prev) => [...prev, data.url]);
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting URL:", error);
      throw error; // Re-lanzar para que se maneje en el componente del formulario
    }
  };

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-100 p-4 text-red-600">
          <p>{error}</p>
          <button onClick={fetchUrls} className="mt-2 text-sm underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">URLs</h3>
            <button
              onClick={handleAddUrl}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              Add URL
            </button>
          </div>

          {urls.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500">No URLs yet</p>
              <button onClick={handleAddUrl} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                Add your first URL
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {urls.map((url) => (
                <div key={url.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <div className="flex-1 overflow-hidden">
                    <a
                      href={url.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                    >
                      {url.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteUrl(url)}
                    className="ml-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                    aria-label="Delete URL"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal para añadir URLs */}
      <UrlModal isOpen={modalOpen} agentId={agentId} onClose={() => setModalOpen(false)} onSubmit={handleSubmitUrl} />

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"></div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Delete URL</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this URL? This action cannot be undone.
                      </p>
                      <div className="mt-2 bg-gray-50 p-2 rounded text-xs text-gray-600 break-all">
                        {deleteConfirmation.url}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
