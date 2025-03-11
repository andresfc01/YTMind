import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

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

  // Almacenamos solo los nombres de las funciones
  const [functions, setFunctions] = useState((agent?.functions || []).map((f) => (typeof f === "string" ? f : f.name)));

  const [availableFunctions, setAvailableFunctions] = useState([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [error, setError] = useState("");

  // Cargar las funciones disponibles
  useEffect(() => {
    const fetchAvailableFunctions = async () => {
      if (isOpen) {
        setLoadingFunctions(true);
        try {
          const response = await fetch("/api/functions");
          if (!response.ok) {
            throw new Error(`Error al cargar funciones: ${response.status}`);
          }
          const data = await response.json();
          console.log("Funciones disponibles cargadas:", data.functions);
          setAvailableFunctions(data.functions || []);
        } catch (error) {
          console.error("Error cargando funciones:", error);
          setError("No se pudieron cargar las funciones disponibles");
        } finally {
          setLoadingFunctions(false);
        }
      }
    };

    fetchAvailableFunctions();
  }, [isOpen]);

  // Actualizar todos los campos cuando se abre el modal o cambia el agente
  useEffect(() => {
    if (isOpen) {
      setName(agent?.name || "");
      setDescription(agent?.description || "");
      setSystemPrompt(agent?.systemPrompt || "");
      setTemperature(agent?.temperature || 0.7);
      setModel(agent?.model || "gemini-2.0-flash");

      // Asegurarnos de manejar tanto arrays de objetos como de strings
      let functionNames = [];
      if (agent?.functions) {
        console.log("Funciones del agente:", agent.functions);
        functionNames = agent.functions
          .map((f) => {
            if (typeof f === "string") {
              return f;
            } else if (f && f.name) {
              return f.name;
            }
            console.warn("Encontrada función con formato incorrecto:", f);
            return null;
          })
          .filter(Boolean); // Eliminar valores nulos
        console.log("Nombres de funciones extraídos:", functionNames);
      }
      setFunctions(functionNames);

      setError("");
    }
  }, [isOpen, agent]);

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

    // Asegurarnos de que functions es siempre un array de strings
    const finalFunctions = functions.filter(Boolean);

    console.log("Enviando formulario con funciones:", finalFunctions);

    onSubmit({
      name,
      description,
      systemPrompt,
      temperature,
      model,
      functions: finalFunctions, // Enviamos el array filtrado
    });
  };

  if (!isOpen) return null;

  // Renderizar el modal en el root usando un portal
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#e5e5e5] bg-white shadow-lg">
        <div className="border-b border-[#e5e5e5] p-4">
          <h2 className="text-lg font-medium text-[#1a1a1a]">{agent ? "Editar agente" : "Crear agente"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
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
          <div className="flex justify-end gap-3 border-t border-[#e5e5e5] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#e5e5e5] bg-white px-4 py-2 text-sm text-[#666666] transition-colors duration-200 hover:bg-[#f5f5f5]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#1a1a1a] px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-[#333333]"
            >
              {agent ? "Guardar cambios" : "Crear agente"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AgentModal;
