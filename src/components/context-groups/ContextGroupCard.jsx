import React, { useState, useRef } from "react";

/**
 * Card component for displaying a context group
 * Now with drag and drop functionality for adding to chat
 */
export default function ContextGroupCard({ contextGroup, onViewDetails, onEdit, onDelete }) {
  const { name, description, items = [], metadata = {} } = contextGroup;
  const itemCount = items.length;
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef(null);

  const handleDragStart = (e) => {
    try {
      // Set simple data first (fallback)
      e.dataTransfer.setData("text/plain", name);

      // Then try to set the complex data
      const data = {
        type: "context-group",
        group: contextGroup,
      };
      e.dataTransfer.setData("application/json", JSON.stringify(data));
      e.dataTransfer.effectAllowed = "copy";

      // Set a drag image that looks better
      if (cardRef.current) {
        // Create a lightweight clone of the card for dragging
        const dragImage = cardRef.current.cloneNode(true);
        dragImage.style.width = `${cardRef.current.offsetWidth}px`;
        dragImage.style.transform = "scale(0.8)";
        dragImage.style.opacity = "0.8";
        dragImage.style.position = "absolute";
        dragImage.style.top = "-1000px";
        dragImage.style.backgroundColor = "white";
        document.body.appendChild(dragImage);

        e.dataTransfer.setDragImage(dragImage, 20, 20);

        // Remove the temporary element after drag starts
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 0);
      }

      // Update visual state
      setIsDragging(true);
    } catch (error) {
      console.error("Error in drag start:", error);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border ${
        isDragging ? "border-blue-500 shadow-lg" : "border-gray-100 shadow-sm"
      } bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-md cursor-grab select-none`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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

          {/* These buttons should stop propagation to avoid triggering drag */}
          <div className="flex flex-shrink-0 items-start space-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(contextGroup);
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 select-auto"
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
              onClick={(e) => {
                e.stopPropagation();
                onDelete(contextGroup);
              }}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 select-auto"
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
      <div className="flex">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(contextGroup);
          }}
          className="flex-1 border-t border-gray-50 px-4 py-3 text-left text-sm font-medium select-auto"
          style={{ backgroundColor: metadata.color || "#6366f1", color: "white" }}
        >
          View Details →
        </button>
        <div
          className="border-t border-gray-50 px-3 py-3 flex items-center justify-center"
          style={{ backgroundColor: metadata.color || "#6366f1", color: "white" }}
          title="Drag to add to chat"
          onMouseDown={(e) => e.stopPropagation()} // Prevent interference with drag
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
