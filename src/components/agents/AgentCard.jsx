import React from "react";

/**
 * Componente que muestra una tarjeta para un agente individual
 * Muestra información básica y acciones disponibles
 */
export default function AgentCard({ agent, onSelect, isSelected, onEdit, onDelete }) {
  // Icons mapping for different agent categories
  const categoryIcons = {
    analysis: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    content: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
    seo: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    general: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  const getModelLabel = (model) => {
    switch (model) {
      case "gemini-2.0-flash":
        return "Gemini 2.0 Flash";
      case "gemini-2.0-pro":
        return "Gemini 2.0 Pro";
      default:
        return model;
    }
  };

  return (
    <div
      className={`mb-3 cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md
        ${
          isSelected
            ? "border-brand-primary bg-background-secondary"
            : "border-white/10 bg-background-primary hover:border-white/20"
        }`}
      onClick={() => onSelect(agent)}
      aria-label={`Select ${agent.name} agent`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
            {getCategoryIcon(agent.category)}
          </div>
          <div>
            <h3 className="text-lg font-medium text-text-primary">{agent.name}</h3>
            <p className="text-sm text-text-secondary">{getModelLabel(agent.model)}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {!agent.isDefault && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(agent);
                }}
                className="rounded p-1 text-text-secondary hover:bg-white/5 hover:text-text-primary"
                aria-label={`Edit ${agent.name} agent`}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(agent);
                }}
                className="rounded p-1 text-text-secondary hover:bg-white/5 hover:text-error"
                aria-label={`Delete ${agent.name} agent`}
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
            </>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-text-secondary line-clamp-2">{agent.description}</p>

      {isSelected && (
        <div className="mt-3 text-xs text-text-secondary">
          <p>Selected for current chat</p>
        </div>
      )}
    </div>
  );
}
