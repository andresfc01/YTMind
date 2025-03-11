import React, { useState, useEffect } from "react";

/**
 * Componente de formulario para crear/editar agentes
 */
export default function AgentForm({ agent = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    model: "gemini-2.0-flash",
    category: "general",
    icon: "bot",
    functions: [],
  });

  const [availableFunctions, setAvailableFunctions] = useState([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar la lista de funciones disponibles
  useEffect(() => {
    const fetchFunctions = async () => {
      setLoadingFunctions(true);
      try {
        const response = await fetch("/api/functions");
        if (!response.ok) {
          throw new Error(`Error fetching functions: ${response.status}`);
        }
        const data = await response.json();
        setAvailableFunctions(data.functions || []);
      } catch (error) {
        console.error("Error loading functions:", error);
        setErrors((prev) => ({
          ...prev,
          functions: "Could not load available functions",
        }));
      } finally {
        setLoadingFunctions(false);
      }
    };

    fetchFunctions();
  }, []);

  // Si se proporciona un agente, llenar el formulario con sus datos
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        description: agent.description || "",
        systemPrompt: agent.systemPrompt || "",
        model: agent.model || "gemini-2.0-flash",
        category: agent.category || "general",
        icon: agent.icon || "bot",
        functions: agent.functions?.map((f) => f.name) || [],
      });
    }
  }, [agent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario empieza a corregir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Manejar la selección de funciones
  const handleFunctionToggle = (functionName) => {
    setFormData((prev) => {
      const currentFunctions = [...prev.functions];

      if (currentFunctions.includes(functionName)) {
        // Si ya está seleccionada, la eliminamos
        return {
          ...prev,
          functions: currentFunctions.filter((f) => f !== functionName),
        };
      } else {
        // Si no está seleccionada, la añadimos
        return {
          ...prev,
          functions: [...currentFunctions, functionName],
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = "System prompt is required";
    } else if (formData.systemPrompt.length < 10) {
      newErrors.systemPrompt = "System prompt is too short";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({
        ...prev,
        form: "An error occurred. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-text-primary">
          Agent Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-background-primary p-2.5 text-text-primary focus:border-brand-primary focus:ring-brand-primary
            ${errors.name ? "border-error" : "border-white/10"}`}
          placeholder="e.g., Channel Analyst"
          disabled={isSubmitting}
        />
        {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-text-primary">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full rounded-lg border bg-background-primary p-2.5 text-text-primary focus:border-brand-primary focus:ring-brand-primary
            ${errors.description ? "border-error" : "border-white/10"}`}
          placeholder="e.g., Analyzes YouTube channels and extracts insights"
          disabled={isSubmitting}
        />
        {errors.description && <p className="mt-1 text-xs text-error">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="systemPrompt" className="mb-1 block text-sm font-medium text-text-primary">
          System Prompt
        </label>
        <textarea
          id="systemPrompt"
          name="systemPrompt"
          value={formData.systemPrompt}
          onChange={handleChange}
          rows="6"
          className={`w-full rounded-lg border bg-background-primary p-2.5 text-text-primary focus:border-brand-primary focus:ring-brand-primary
            ${errors.systemPrompt ? "border-error" : "border-white/10"}`}
          placeholder="Detailed instructions for the AI agent..."
          disabled={isSubmitting}
        ></textarea>
        {errors.systemPrompt && <p className="mt-1 text-xs text-error">{errors.systemPrompt}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="model" className="mb-1 block text-sm font-medium text-text-primary">
            AI Model
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-background-primary p-2.5 text-text-primary focus:border-brand-primary focus:ring-brand-primary"
            disabled={isSubmitting}
          >
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-text-primary">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-background-primary p-2.5 text-text-primary focus:border-brand-primary focus:ring-brand-primary"
            disabled={isSubmitting}
          >
            <option value="analysis">Analysis</option>
            <option value="content">Content</option>
            <option value="seo">SEO</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* Selección de funciones */}
      <div>
        <label className="mb-1 block text-sm font-medium text-text-primary">Available Functions</label>
        <div
          className={`mt-2 rounded-lg border border-white/10 bg-background-secondary p-2 ${
            errors.functions ? "border-error" : ""
          }`}
        >
          {loadingFunctions ? (
            <div className="flex justify-center py-4">
              <svg className="h-5 w-5 animate-spin text-text-secondary" viewBox="0 0 24 24">
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
            </div>
          ) : availableFunctions.length === 0 ? (
            <p className="py-2 text-center text-sm text-text-secondary">No functions available</p>
          ) : (
            <div className="space-y-2">
              {availableFunctions.map((func) => (
                <div key={func.name} className="flex items-center rounded-md p-2 hover:bg-white/5">
                  <input
                    type="checkbox"
                    id={`func-${func.name}`}
                    checked={formData.functions.includes(func.name)}
                    onChange={() => handleFunctionToggle(func.name)}
                    className="h-4 w-4 rounded border-white/30 bg-background-primary text-brand-primary focus:ring-brand-primary"
                    disabled={isSubmitting}
                  />
                  <label htmlFor={`func-${func.name}`} className="ml-2 flex-grow cursor-pointer text-sm">
                    <div className="font-medium text-text-primary">{func.name}</div>
                    <div className="text-xs text-text-secondary">{func.description}</div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.functions && <p className="mt-1 text-xs text-error">{errors.functions}</p>}
      </div>

      {errors.form && <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{errors.form}</div>}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-background-primary px-4 py-2 text-text-primary hover:bg-white/5"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primary/90 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
              Saving...
            </span>
          ) : agent ? (
            "Update Agent"
          ) : (
            "Create Agent"
          )}
        </button>
      </div>
    </form>
  );
}
