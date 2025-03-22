import React from "react";
import ContextGroupCard from "./ContextGroupCard";

/**
 * Component to display a list of context groups
 */
export default function ContextGroupList({ contextGroups, onSelect, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!contextGroups || contextGroups.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-8 text-center shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No context groups found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new context group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contextGroups.map((contextGroup) => (
        <ContextGroupCard
          key={contextGroup._id}
          contextGroup={contextGroup}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
