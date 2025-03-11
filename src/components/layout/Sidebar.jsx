import React, { useState, useEffect } from "react";
import { AgentList, AgentModal } from "@/components/agents";

/**
 * Componente para renderizar un ítem de chat con su botón de eliminar
 */
const ChatItem = ({ chat, onLoadChat, onDeleteChat, isDeleting }) => {
  // Estado para controlar el hover manual
  const [isHovering, setIsHovering] = useState(false);

  // Manejadores de eventos para el hover
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-white/10 ${
        isHovering ? "bg-white/5" : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        className="h-4 w-4 shrink-0 text-text-secondary"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* Botón para cargar el chat (ocupa la mayor parte del espacio) */}
      <button
        type="button"
        className="flex-1 text-left truncate py-1"
        onClick={() => onLoadChat(chat.id)}
        aria-label={`Cargar chat: ${chat.title}`}
      >
        <span className="block truncate">{chat.title}</span>
      </button>

      {/* Botón de eliminar (papelera) - Visible condicionalmente */}
      {isHovering && (
        <button
          type="button"
          className="absolute right-2 rounded-md p-1 text-text-secondary hover:bg-white/10 hover:text-text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteChat(chat.id, e);
          }}
          disabled={isDeleting}
          aria-label={`Eliminar chat: ${chat.title}`}
        >
          {isDeleting ? (
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
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
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

/**
 * Sidebar component that exactly matches ChatGPT's sidebar design
 * Includes chat history, folder organization, and settings
 */
export default function Sidebar({
  onNewChat,
  chatHistory = [],
  onLoadChat,
  onDeleteChat,
  isLoading = false,
  isDeleting = false,
  selectedAgentId = null,
  onSelectAgent = () => {},
}) {
  // Agrupar chats por fecha
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todayChats = chatHistory.filter((chat) => new Date(chat.createdAt).toDateString() === today);
  const yesterdayChats = chatHistory.filter((chat) => new Date(chat.createdAt).toDateString() === yesterday);
  const olderChats = chatHistory.filter((chat) => {
    const chatDate = new Date(chat.createdAt).toDateString();
    return chatDate !== today && chatDate !== yesterday;
  });

  // Estado para los agentes
  const [agents, setAgents] = useState([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agentError, setAgentError] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  // Cargar agentes al montar el componente
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoadingAgents(true);
        const response = await fetch("/api/agents");

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setAgents(data.agents || []);
        setAgentError(null);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setAgentError("Failed to load agents");
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // Manejadores para agentes
  const handleCreateAgent = () => {
    setEditingAgent(null);
    setShowAgentModal(true);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowAgentModal(true);
  };

  const handleDeleteAgent = async (agent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Actualizar la lista de agentes
      setAgents((prevAgents) => prevAgents.filter((a) => a.id !== agent.id));
    } catch (err) {
      console.error("Error deleting agent:", err);
      alert("Failed to delete agent");
    }
  };

  const handleSubmitAgent = async (formData) => {
    try {
      // Si editingAgent existe, actualizar; de lo contrario, crear
      const url = editingAgent ? `/api/agents/${editingAgent.id}` : "/api/agents";

      const method = editingAgent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Actualizar la lista de agentes
      if (editingAgent) {
        setAgents((prevAgents) => prevAgents.map((agent) => (agent.id === editingAgent.id ? data.agent : agent)));
      } else {
        setAgents((prevAgents) => [...prevAgents, data.agent]);
      }

      // Cerrar el modal
      setShowAgentModal(false);
      setEditingAgent(null);

      return data.agent;
    } catch (err) {
      console.error("Error submitting agent:", err);
      throw new Error("Failed to save agent");
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#f7f7f8]">
      {/* New chat button */}
      <div className="flex-shrink-0 border-b border-[#e5e5e5] p-2">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md border border-[#e5e5e5] bg-white p-3 text-sm transition-colors duration-200 hover:bg-[#f5f5f5]"
          onClick={onNewChat}
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
          <span>Nuevo chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbarthin p-2">
        {/* Chat history */}
        <div className="mb-4">
          {isLoading ? (
            // Indicador de carga
            <div className="flex flex-col items-center justify-center h-32">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#666666] mb-2"></div>
              <span className="text-sm text-[#666666]">Cargando chats...</span>
            </div>
          ) : chatHistory.length === 0 ? (
            // Mensaje cuando no hay chats
            <div className="flex flex-col items-center justify-center h-20 text-[#666666]">
              <p className="text-sm">No hay chats disponibles</p>
            </div>
          ) : (
            // Lista de chats agrupados por fecha
            <div className="space-y-4">
              {/* Chats de hoy */}
              {todayChats.length > 0 && (
                <div>
                  <h3 className="mb-2 px-3 text-xs font-medium text-[#666666]">Hoy</h3>
                  <div className="space-y-1">
                    {todayChats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        onLoadChat={onLoadChat}
                        onDeleteChat={onDeleteChat}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Chats de ayer */}
              {yesterdayChats.length > 0 && (
                <div>
                  <h3 className="mb-2 px-3 text-xs font-medium text-[#666666]">Ayer</h3>
                  <div className="space-y-1">
                    {yesterdayChats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        onLoadChat={onLoadChat}
                        onDeleteChat={onDeleteChat}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Chats más antiguos */}
              {olderChats.length > 0 && (
                <div>
                  <h3 className="mb-2 px-3 text-xs font-medium text-[#666666]">Anteriores</h3>
                  <div className="space-y-1">
                    {olderChats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        onLoadChat={onLoadChat}
                        onDeleteChat={onDeleteChat}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección de Agentes con separador */}
        <div className="relative mb-4 mt-6 pt-6 before:absolute before:top-0 before:left-2 before:right-2 before:border-t before:border-[#e5e5e5]">
          <h2 className="mb-2 px-3 text-xs font-medium text-[#666666]">Agentes</h2>

          {isLoadingAgents ? (
            <div className="flex flex-col items-center justify-center h-20">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#666666] mb-2"></div>
              <span className="text-xs text-[#666666]">Cargando agentes...</span>
            </div>
          ) : agentError ? (
            <div className="px-3 py-2 text-xs text-[#666666]">
              <p>{agentError}</p>
              <button onClick={() => window.location.reload()} className="mt-1 text-xs underline">
                Reintentar
              </button>
            </div>
          ) : (
            <div className="px-1">
              <AgentList
                agents={agents}
                selectedAgentId={selectedAgentId}
                onSelectAgent={onSelectAgent}
                onEditAgent={handleEditAgent}
                onDeleteAgent={handleDeleteAgent}
                onCreateAgent={handleCreateAgent}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar agentes */}
      <AgentModal
        isOpen={showAgentModal}
        agent={editingAgent}
        onClose={() => setShowAgentModal(false)}
        onSubmit={handleSubmitAgent}
      />
    </div>
  );
}
