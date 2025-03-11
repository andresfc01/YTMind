import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

/**
 * Componente para seleccionar un agente en la interfaz de chat
 */
export default function AgentSelector({ agents = [], selectedAgentId = null, onSelectAgent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const checkPosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const spaceBelow = windowHeight - buttonRect.bottom;
        setOpenUpwards(spaceBelow < 200); // Si hay menos de 200px debajo, abrimos hacia arriba
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", checkPosition);
    window.addEventListener("resize", checkPosition);

    // Comprobar posición inicial
    checkPosition();

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", checkPosition);
      window.removeEventListener("resize", checkPosition);
    };
  }, []);

  // Helpers para categorías y modelos
  const getCategoryLabel = (category) => {
    const labels = {
      analysis: "Analysis",
      content: "Content",
      seo: "SEO",
      general: "General",
    };
    return labels[category] || "General";
  };

  const getModelLabel = (model) => {
    const labels = {
      "gemini-2.0-flash": "Gemini 2.0 Flash",
      "gemini-2.0-pro": "Gemini 2.0 Pro",
    };
    return labels[model] || model;
  };

  // Iconos para las categorías
  const categoryIcons = {
    analysis: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    content: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    seo: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    general: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  };

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || categoryIcons.general;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-background-secondary px-3 py-1.5 text-sm text-text-primary hover:bg-white/5"
      >
        {selectedAgent ? (
          <span className="truncate">{selectedAgent.name}</span>
        ) : (
          <span className="text-text-secondary">Seleccionar Agente</span>
        )}
        <FiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && agents.length > 0 && (
        <div
          className={`absolute ${
            openUpwards ? "bottom-full mb-1" : "top-full mt-1"
          } left-0 z-10 w-64 rounded-lg border border-white/10 bg-background-secondary py-1 shadow-lg`}
        >
          {/* Opción para deseleccionar agente */}
          <button
            onClick={() => {
              onSelectAgent(null);
              setIsOpen(false);
            }}
            className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-white/5 ${
              !selectedAgentId ? "bg-white/10 text-text-primary" : "text-text-secondary"
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">Sin agente</span>
              <span className="text-xs text-text-secondary line-clamp-1">Usar chat sin agente especializado</span>
            </div>
          </button>

          {/* Separador */}
          <div className="my-1 border-t border-white/10"></div>

          {/* Lista de agentes */}
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                onSelectAgent(agent.id);
                setIsOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-white/5 ${
                selectedAgentId === agent.id ? "bg-white/10 text-text-primary" : "text-text-secondary"
              }`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{agent.name}</span>
                <span className="text-xs text-text-secondary line-clamp-1">{agent.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
