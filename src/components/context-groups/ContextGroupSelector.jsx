import React, { useState, useEffect } from "react";

/**
 * Component for displaying context groups in the sidebar
 */
export default function ContextGroupSelector({ contextGroups = [], onEdit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [localContextGroups, setLocalContextGroups] = useState(contextGroups);

  useEffect(() => {
    if (contextGroups.length > 0) {
      setLocalContextGroups(contextGroups);
    } else {
      fetchContextGroups();
    }
  }, [contextGroups]);

  const fetchContextGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/context-groups");

      if (!response.ok) {
        throw new Error(`Failed to fetch context groups: ${response.status}`);
      }

      const data = await response.json();
      setLocalContextGroups(data);
    } catch (err) {
      console.error("Error fetching context groups:", err);
      setError("Failed to load context groups.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">
        <p>{error}</p>
        <button onClick={fetchContextGroups} className="mt-2 text-blue-500 underline">
          Try again
        </button>
      </div>
    );
  }

  if (localContextGroups.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-center">
        <div className="px-4">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No context groups yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-1">
      <div className="space-y-0.5">
        {localContextGroups.map((group) => (
          <div
            key={group._id}
            className="group flex items-center justify-between rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-gray-100"
          >
            <div className="flex min-w-0 flex-1 items-center">
              <div
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: group.metadata?.color || "#6366f1" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 text-white"
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
              <span className="ml-2 truncate text-sm font-medium text-gray-700">{group.name}</span>
            </div>
            {onEdit && (
              <button
                onClick={() => onEdit(group)}
                className="ml-2 hidden rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600 group-hover:block"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
