import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { DocumentManager } from "../documents";
import UrlManager from "../url/UrlManager";

/**
 * Modal para crear/editar agentes
 * Usa un portal para renderizarse fuera de la jerarquía del Sidebar
 */
const AgentModal = ({ isOpen, agent, onClose, onSubmit }) => {
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt || "");
  const [temperature, setTemperature] = useState(agent?.temperature || 0.7);
  const [model, setModel] = useState(agent?.model || "gemini-2.0-flash");
  const [category, setCategory] = useState(agent?.category || "general");
  const [icon, setIcon] = useState(agent?.icon || "bot");
  const [loading, setLoading] = useState(false);

  // Almacenamos solo los nombres de las funciones
  const [functions, setFunctions] = useState((agent?.functions || []).map((f) => (typeof f === "string" ? f : f.name)));

  const [availableFunctions, setAvailableFunctions] = useState([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const modalRef = useRef(null);

  // Cargar las funciones disponibles
  useEffect(() => {
    const fetchAvailableFunctions = async () => {
      if (isOpen) {
        setLoadingFunctions(true);
        try {
          const response = await fetch("/api/functions");
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          const data = await response.json();
          setAvailableFunctions(data.functions || []);
        } catch (error) {
          console.error("Error al cargar las funciones disponibles:", error);
          setError("No se pudieron cargar las funciones. Inténtalo de nuevo más tarde.");
        } finally {
          setLoadingFunctions(false);
        }
      }
    };

    if (isOpen) {
      fetchAvailableFunctions();

      // Siempre empezamos en la pestaña general cuando se abre el modal
      setActiveTab("details");
    }
  }, [isOpen]);

  // Cargar los datos del agente cuando cambia
  useEffect(() => {
    if (agent) {
      setName(agent.name || "");
      setDescription(agent.description || "");
      setSystemPrompt(agent.systemPrompt || "");
      setTemperature(agent.temperature || 0.7);
      setModel(agent.model || "gemini-2.0-flash");
      setCategory(agent.category || "general");
      setIcon(agent.icon || "bot");

      // Parsear las funciones
      const functionNames = (agent.functions || [])
        .map((f) => {
          if (typeof f === "string") return f;
          if (f && f.name) return f.name;
          return null;
        })
        .filter(Boolean);

      setFunctions(functionNames);
    }
  }, [agent]);

  // Manejar el toggle de una función
  const handleFunctionToggle = (functionName) => {
    console.log(`Toggle de la función: ${functionName}`);
    setFunctions((prev) => {
      const isSelected = prev.includes(functionName);
      console.log(`La función ${functionName} está ${isSelected ? "seleccionada" : "no seleccionada"}`);

      if (isSelected) {
        const newFunctions = prev.filter((f) => f !== functionName);
        console.log("Nuevas funciones después de quitar:", newFunctions);
        return newFunctions;
      } else {
        const newFunctions = [...prev, functionName];
        console.log("Nuevas funciones después de añadir:", newFunctions);
        return newFunctions;
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación básica
    if (!name.trim() || !description.trim() || !systemPrompt.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);
    setError("");

    // Construir datos del agente
    const agentData = {
      name,
      description,
      systemPrompt,
      temperature: parseFloat(temperature),
      model,
      category,
      icon,
      functions,
    };

    try {
      onSubmit(agentData);
    } catch (error) {
      console.error("Error al guardar el agente:", error);
      setError("Error al guardar el agente");
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setError("");
    setActiveTab(tab);
  };

  // Si no hay que mostrar el modal, no renderizamos nada
  if (!isOpen) return null;

  // Solo renderizamos componentes en el cliente, no en el servidor
  if (typeof window === "undefined") {
    return null; // No renderizamos nada en el servidor
  }

  // En el cliente, usamos createPortal
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 p-4">
      <div ref={modalRef} className="w-full max-w-4xl rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">{agent ? "Edit Agent" : "Create Agent"}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {agent && (
          <div className="border-b">
            <nav className="flex">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "details" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                }`}
                onClick={() => handleTabChange("details")}
              >
                Details
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "documents" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                }`}
                onClick={() => handleTabChange("documents")}
              >
                Documents
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "urls" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
                }`}
                onClick={() => handleTabChange("urls")}
              >
                URLs
              </button>
            </nav>
          </div>
        )}

        <div className="h-[60vh] overflow-y-auto p-4">
          {activeTab === "details" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#999999] focus:border-[#666666] focus:outline-none"
                  placeholder="Nombre del agente"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#999999] focus:border-[#666666] focus:outline-none"
                  placeholder="Describe el propósito del agente"
                  rows={3}
                  required
                />
              </div>

              {/* Prompt del sistema */}
              <div>
                <label htmlFor="systemPrompt" className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Prompt del sistema
                </label>
                <textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#1a1a1a] placeholder-[#999999] focus:border-[#666666] focus:outline-none"
                  placeholder="Instrucciones para el agente"
                  rows={5}
                  required
                />
              </div>

              {/* Selección de funciones */}
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">Funciones disponibles</label>
                <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-[#e5e5e5] bg-[#f9f9f9] p-2">
                  {loadingFunctions ? (
                    <div className="flex items-center justify-center py-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#666666]"></div>
                      <span className="ml-2 text-sm text-[#666666]">Cargando funciones...</span>
                    </div>
                  ) : availableFunctions.length === 0 ? (
                    <p className="py-2 text-center text-sm text-[#999999]">No hay funciones disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {availableFunctions.map((func) => (
                        <div key={func.name} className="flex items-center rounded-md p-2 hover:bg-white">
                          <input
                            type="checkbox"
                            id={`func-${func.name}`}
                            checked={functions.includes(func.name)}
                            onChange={() => handleFunctionToggle(func.name)}
                            className="h-4 w-4 rounded border-[#d1d1d1] text-[#1a1a1a] focus:ring-[#666666]"
                          />
                          <label htmlFor={`func-${func.name}`} className="ml-2 cursor-pointer">
                            <div className="text-sm font-medium text-[#1a1a1a]">{func.name}</div>
                            <div className="text-xs text-[#666666]">{func.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              {/* Temperatura */}
              <div>
                <label htmlFor="temperature" className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Temperatura: {temperature}
                </label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1 flex justify-between text-xs text-[#666666]">
                  <span>Preciso</span>
                  <span>Creativo</span>
                </div>
              </div>

              {/* Modelo */}
              <div>
                <label htmlFor="model" className="mb-1 block text-sm font-medium text-[#1a1a1a]">
                  Modelo
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#1a1a1a] focus:border-[#666666] focus:outline-none"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#666666] hover:bg-[#f5f5f5]"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#0066cc] px-4 py-2 text-sm text-white hover:bg-[#0052a3]"
                  disabled={loading}
                >
                  {loading ? "Saving..." : agent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          ) : activeTab === "documents" ? (
            <div className="h-full">{agent && <DocumentManager agentId={agent.id} />}</div>
          ) : (
            <div className="h-full">{agent && <UrlManager agentId={agent.id} />}</div>
          )}
        </div>
      </div>
    </div>,
    document.getElementById("root") || document.body
  );
};

export default AgentModal;
