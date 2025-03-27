import React from "react";

/**
 * Component for displaying context groups in the sidebar
 */
export default function ContextGroupSelector({ contextGroups = [], onViewDetails, onEdit }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Context Groups</h2>
          <p className="text-sm text-gray-500">Organize your content in groups</p>
        </div>
        <button
          onClick={() => onEdit(null)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
        >
          <svg
            className="-ml-0.5 mr-1.5 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2">
        {contextGroups.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-4">
            <svg
              className="mb-2 h-8 w-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
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
            <p className="text-sm text-gray-500">No groups yet</p>
          </div>
        ) : (
          contextGroups.map((group) => (
            <div
              key={group._id}
              className="group relative flex cursor-pointer items-center rounded-lg p-2 hover:bg-gray-50"
              onClick={() => onViewDetails(group)}
            >
              <div
                className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: group.metadata?.color || "#6366f1" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
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
                <p className="truncate text-sm font-medium text-gray-900">{group.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {group.items?.length || 0} {group.items?.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="ml-2 flex opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(group);
                  }}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
