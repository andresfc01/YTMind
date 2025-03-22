import React, { useState, useEffect } from "react";

/**
 * Component for selecting context groups to use in a chat
 */
export default function ContextGroupSelector({ onSelect, selectedGroupIds = [] }) {
  const [contextGroups, setContextGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContextGroups();
  }, []);

  const fetchContextGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/context-groups");

      if (!response.ok) {
        throw new Error(`Failed to fetch context groups: ${response.status}`);
      }

      const data = await response.json();
      setContextGroups(data);
    } catch (err) {
      console.error("Error fetching context groups:", err);
      setError("Failed to load context groups.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGroup = (groupId) => {
    if (selectedGroupIds.includes(groupId)) {
      onSelect(selectedGroupIds.filter((id) => id !== groupId));
    } else {
      onSelect([...selectedGroupIds, groupId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
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

  if (contextGroups.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        <p>No context groups available. Create some in the groups manager.</p>
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto p-2">
      <h3 className="mb-2 font-medium text-gray-700">Select Context Groups</h3>
      <div className="space-y-2">
        {contextGroups.map((group) => (
          <div key={group._id} className="flex items-center rounded-md p-2 hover:bg-gray-50">
            <input
              type="checkbox"
              id={`group-${group._id}`}
              checked={selectedGroupIds.includes(group._id)}
              onChange={() => handleToggleGroup(group._id)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`group-${group._id}`} className="ml-2 flex-1 cursor-pointer">
              <div className="font-medium text-gray-800">{group.name}</div>
              <div className="text-xs text-gray-500">
                {group.items.length} {group.items.length === 1 ? "item" : "items"}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
