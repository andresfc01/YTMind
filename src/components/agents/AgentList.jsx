import React from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import AgentItem from "./AgentItem";

/**
 * Componente que muestra una lista de agentes disponibles
 * Permite filtrar y seleccionar agentes
 */
const AgentList = ({
  agents = [],
  selectedAgentId = null,
  onSelectAgent,
  onEditAgent,
  onDeleteAgent,
  onCreateAgent,
}) => {
  return (
    <div className="space-y-2">
      {/* Lista de agentes */}
      {agents.map((agent) => (
        <AgentItem
          key={agent.id}
          agent={agent}
          isSelected={agent.id === selectedAgentId}
          onSelect={() => onSelectAgent(agent)}
          onEdit={() => onEditAgent(agent)}
          onDelete={() => onDeleteAgent(agent.id)}
        />
      ))}

      {/* Botón para crear nuevo agente */}
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-md border border-[#e5e5e5] bg-white p-2 text-sm text-[#666666] transition-colors duration-200 hover:bg-[#f5f5f5]"
        onClick={onCreateAgent}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Crear agente</span>
      </button>
    </div>
  );
};

export default AgentList;
