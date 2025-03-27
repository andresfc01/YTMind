import React, { useState, useEffect } from "react";

/**
 * Form for creating or editing a context group
 */
export default function ContextGroupForm({ contextGroup, onSubmit, onCancel, isSubmitting }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [error, setError] = useState(null);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (contextGroup) {
      setName(contextGroup.name || "");
      setDescription(contextGroup.description || "");
      setColor(contextGroup.metadata?.color || "#6366f1");
    }
  }, [contextGroup]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      metadata: {
        icon: "folder", // Always use folder icon
        color,
        tags: contextGroup?.metadata?.tags || [],
      },
    });
  };

  const colorOptions = [
    { value: "#6366f1", label: "Indigo", className: "bg-indigo-500" },
    { value: "#8b5cf6", label: "Purple", className: "bg-purple-500" },
    { value: "#ec4899", label: "Pink", className: "bg-pink-500" },
    { value: "#ef4444", label: "Red", className: "bg-red-500" },
    { value: "#f97316", label: "Orange", className: "bg-orange-500" },
    { value: "#eab308", label: "Yellow", className: "bg-yellow-500" },
    { value: "#22c55e", label: "Green", className: "bg-green-500" },
    { value: "#06b6d4", label: "Cyan", className: "bg-cyan-500" },
    { value: "#3b82f6", label: "Blue", className: "bg-blue-500" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="My Group"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder="A collection of related content..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="grid grid-cols-3 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setColor(option.value)}
              className={`
                h-12 rounded-md flex items-center justify-center ${option.className}
                ${color === option.value ? "ring-2 ring-offset-2 ring-blue-500" : ""}
                transition-all duration-200 hover:opacity-90
              `}
            >
              {color === option.value && (
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          {isSubmitting ? "Saving..." : contextGroup ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
