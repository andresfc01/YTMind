import React from "react";
import ContextGroupCard from "./ContextGroupCard";

/**
 * Component for displaying a grid of context group cards
 */
export default function ContextGroupList({ contextGroups = [], onViewDetails, onEdit, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="grid w-full grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                <div className="h-3 w-1/4 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="mt-4 h-8 w-full rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border-2 border-red-100 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (contextGroups.length === 0) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No context groups</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new group</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6">
      {contextGroups.map((group) => (
        <ContextGroupCard key={group._id} contextGroup={group} onViewDetails={onViewDetails} onEdit={onEdit} />
      ))}
    </div>
  );
}
