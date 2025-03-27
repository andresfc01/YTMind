import React from "react";

/**
 * Card component for displaying a context group
 */
export default function ContextGroupCard({ contextGroup, onViewDetails, onEdit, onDelete }) {
  const { name, description, items = [], metadata = {} } = contextGroup;
  const itemCount = items.length;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md">
      <div className="px-4 py-4">
        <div className="flex items-center space-x-4">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: metadata.color || "#6366f1" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-medium text-gray-900">{name}</h3>
            {description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{description}</p>}
            <p className="mt-1 text-sm font-medium text-gray-600">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-start space-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={() => onEdit(contextGroup)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onViewDetails(contextGroup)}
        className="mt-2 block w-full border-t border-gray-50 px-4 py-3 text-left text-sm font-medium"
        style={{ backgroundColor: metadata.color || "#6366f1", color: "white" }}
      >
        View Details →
      </button>
    </div>
  );
}
