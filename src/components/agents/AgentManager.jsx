import React, { useState, useEffect } from "react";
import AgentList from "./AgentList";
import AgentModal from "./AgentModal";

/**
 * Componente principal para gestionar agentes
 * Integra la lista de agentes y el modal para crear/editar
 */
export default function AgentManager({ onSelectAgent, selectedAgentId }) {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar agentes al montar el componente
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/agents");

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Agentes obtenidos del servidor:", data.agents);

        // Validar que los agentes incluyan sus funciones y todos los campos necesarios
        const agentsWithValidData = data.agents.map((agent) => {
          // Verificar que el agente tenga todos los campos básicos
          const validAgent = {
            id: agent.id || "",
            name: agent.name || "Agente sin nombre",
            description: agent.description || "Sin descripción",
            systemPrompt: agent.systemPrompt || "",
            temperature: typeof agent.temperature === "number" ? agent.temperature : 0.7,
            model: agent.model || "gemini-2.0-flash",
            category: agent.category || "general",
            icon: agent.icon || "bot",
            isDefault: !!agent.isDefault,
            createdAt: agent.createdAt || new Date().toISOString(),
            updatedAt: agent.updatedAt || new Date().toISOString(),
          };

          // Verificar las funciones
          if (!agent.functions) {
            console.warn(`Agente ${agent.name || "sin nombre"} sin array de funciones definido`);
            validAgent.functions = [];
          } else if (!Array.isArray(agent.functions)) {
            console.warn(
              `Agente ${agent.name || "sin nombre"} tiene funciones en formato incorrecto:`,
              agent.functions
            );
            validAgent.functions = [];
          } else {
            console.log(
              `Agente ${agent.name || "sin nombre"} con ${agent.functions.length} funciones:`,
              agent.functions
            );
            validAgent.functions = agent.functions;
          }

          return validAgent;
        });

        setAgents(agentsWithValidData || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching agents:", err);
        setError("Failed to load agents. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Abrir modal para crear un nuevo agente
  const handleCreateAgent = () => {
    setEditingAgent(null);
    setModalOpen(true);
  };

  // Abrir modal para editar un agente existente
  const handleEditAgent = async (agent) => {
    try {
      console.log("Iniciando edición del agente:", agent.id);
      console.log("Datos iniciales del agente:", agent);

      // Verificar si el agente ya tiene funciones
      if (agent.functions && agent.functions.length > 0) {
        console.log("El agente ya tiene funciones en el objeto:", agent.functions);
      } else {
        console.log("El agente no tiene funciones en el objeto, intentando obtenerlas del API");

        // Obtener funciones del agente si existen
        const functionResponse = await fetch(`/api/agents/${agent.id}/functions`);
        if (functionResponse.ok) {
          const functionData = await functionResponse.json();
          console.log("Funciones obtenidas del agente:", functionData.functions);
          // Añadimos las funciones al objeto del agente
          agent = {
            ...agent,
            functions: functionData.functions || [],
          };
        } else {
          const errorText = await functionResponse.text();
          console.error("Error al obtener funciones:", errorText);
        }
      }

      // Como medida adicional, obtenemos el agente directamente para asegurarnos de tener los datos más recientes
      try {
        const agentResponse = await fetch(`/api/agents/${agent.id}`);
        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          console.log("Datos actualizados del agente:", agentData.agent);

          // Mezclamos los datos, dando prioridad a los datos recién obtenidos
          agent = {
            ...agent,
            ...agentData.agent,
            // Aseguramos que las funciones estén siempre presentes
            functions: agentData.agent.functions || agent.functions || [],
          };

          console.log("Agente final para edición:", agent);
        }
      } catch (agentFetchError) {
        console.error("Error obteniendo datos actualizados del agente:", agentFetchError);
      }
    } catch (error) {
      console.error("Error fetching agent functions:", error);
    }

    setEditingAgent(agent);
    setModalOpen(true);
  };

  // Manejar el envío del formulario (crear/editar)
  const handleSubmitAgent = async (formData) => {
    setIsSubmitting(true);
    console.log("Submitting agent with all data:", formData);

    try {
      // Si editingAgent existe, actualizar; de lo contrario, crear
      const url = editingAgent ? `/api/agents/${editingAgent.id}` : "/api/agents";
      const method = editingAgent ? "PUT" : "POST";

      // Enviamos TODOS los datos, incluyendo las funciones
      const dataToSend = {
        ...formData,
        temperature: parseFloat(formData.temperature) || 0.7,
      };

      console.log("Sending complete agent data:", dataToSend);

      // Actualizamos el agente con todos sus datos en una sola operación
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Agent created/updated with complete data:", data.agent);

      // Actualizar la lista de agentes
      if (editingAgent) {
        setAgents((prevAgents) => prevAgents.map((agent) => (agent.id === editingAgent.id ? data.agent : agent)));
      } else {
        setAgents((prevAgents) => [...prevAgents, data.agent]);
      }

      // Cerrar el modal
      setModalOpen(false);
      setEditingAgent(null);
    } catch (err) {
      console.error("Error submitting agent:", err);
      throw new Error("Failed to save agent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar un agente
  const handleDeleteAgent = async (agent) => {
    if (!confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Actualizar la lista de agentes
      setAgents((prevAgents) => prevAgents.filter((a) => a.id !== agent.id));
    } catch (err) {
      console.error("Error deleting agent:", err);
      alert("Failed to delete agent. Please try again.");
    }
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAgent(null);
  };

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-4 text-2xl font-semibold text-text-primary">Manage Agents</h1>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 animate-spin text-brand-primary" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-text-secondary">Loading agents...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-error/10 p-4 text-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-sm underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="flex-grow">
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

      <AgentModal isOpen={modalOpen} agent={editingAgent} onClose={handleCloseModal} onSubmit={handleSubmitAgent} />
    </div>
  );
}
