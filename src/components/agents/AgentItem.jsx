const AgentItem = ({ agent, isSelected, onSelect, onEdit, onDelete }) => {
  // Verificar que el agente tenga todos los campos necesarios
  if (!agent || typeof agent !== "object") {
    console.error("AgentItem recibió un agente inválido:", agent);
    return null;
  }

  // Verificar si el agente tiene funciones asignadas
  const hasFunctions = agent.functions && Array.isArray(agent.functions) && agent.functions.length > 0;

  console.log(
    `AgentItem - Agente: ${agent.name || "Sin nombre"}, ID: ${agent.id || "Sin ID"}, tiene funciones:`,
    hasFunctions
  );
  if (hasFunctions) {
    console.log(`AgentItem - Funciones del agente ${agent.name || "Sin nombre"}:`, agent.functions);
  }

  return (
    <div
      className={`group relative flex flex-col gap-2 rounded-md border ${
        isSelected ? "border-[#e5e5e5] bg-white" : "border-transparent hover:border-[#e5e5e5] hover:bg-[#f5f5f5]"
      } p-2 transition-colors duration-200`}
    >
      <div className="flex items-center gap-3">
        {/* Agent info button */}
        <button type="button" className="flex flex-1 items-start gap-3 text-left" onClick={onSelect}>
          {/* Agent icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mt-0.5 h-4 w-4 flex-shrink-0 ${isSelected ? "text-[#1a1a1a]" : "text-[#666666]"}`}
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>

          {/* Agent name and description */}
          <div className="flex-1 overflow-hidden">
            <h3 className={`truncate text-sm font-medium ${isSelected ? "text-[#1a1a1a]" : "text-[#666666]"}`}>
              {agent.name || "Agente sin nombre"}
            </h3>
            <p className={`mt-0.5 line-clamp-2 text-xs ${isSelected ? "text-[#666666]" : "text-[#999999]"}`}>
              {agent.description || "Sin descripción"}
            </p>
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {/* Edit button */}
          <button
            type="button"
            className={`rounded-md p-1 transition-colors duration-200 hover:bg-[#f0f0f0] ${
              isSelected ? "text-[#1a1a1a]" : "text-[#666666]"
            }`}
            onClick={() => onEdit(agent)}
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {/* Delete button */}
          <button
            type="button"
            className={`rounded-md p-1 transition-colors duration-200 hover:bg-[#f0f0f0] ${
              isSelected ? "text-[#1a1a1a]" : "text-[#666666]"
            }`}
            onClick={() => onDelete(agent)}
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
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Funciones asignadas (si existen) */}
      {hasFunctions && (
        <div className="mt-1 flex flex-wrap gap-1 border-t border-dashed border-[#e5e5e5] pt-1">
          {agent.functions.map((func, index) => {
            // Manejar tanto el caso en que func sea string como cuando es objeto
            const funcName = typeof func === "string" ? func : func && func.name ? func.name : `Función ${index + 1}`;
            const funcDesc =
              typeof func === "string" ? funcName : func && func.description ? func.description : "Sin descripción";

            console.log(`AgentItem - Función ${index + 1}:`, func, "- Nombre usado:", funcName);

            return (
              <span
                key={funcName || index}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                  isSelected ? "bg-[#f0f0f0] text-[#666666]" : "bg-[#f5f5f5] text-[#999999]"
                }`}
                title={funcDesc}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-2.5 w-2.5"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                {funcName || "Función desconocida"}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgentItem;
