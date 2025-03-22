import React from "react";

/**
 * Card component for displaying a context group
 */
export default function ContextGroupCard({ contextGroup, onSelect, onEdit, onDelete }) {
  const { name, description, items = [], metadata = {} } = contextGroup;
  const itemCount = items.length;

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: metadata.color || "#6366f1" }}
            >
              <span className="text-lg text-white">{metadata.icon ? metadata.icon : name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{name}</h3>
              <p className="text-sm text-gray-500">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(contextGroup)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(contextGroup)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-red-500"
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
          </div>
        </div>

        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
        <button
          onClick={() => onSelect(contextGroup)}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
        >
          Use in Chat
        </button>
      </div>
    </div>
  );
}
