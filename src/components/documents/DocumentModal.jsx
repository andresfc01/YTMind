import React, { useState } from "react";
import DocumentForm from "./DocumentForm";

/**
 * Modal simplificado para la gestión de documentos
 */
export default function DocumentModal({ isOpen, agentId, onClose, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting document:", error);
      setError("An error occurred while saving the document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(3px)",
      }}
    >
      <div className="relative w-full max-w-md rounded-lg overflow-hidden bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-medium text-gray-800">Upload Document</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <DocumentForm agentId={agentId} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
