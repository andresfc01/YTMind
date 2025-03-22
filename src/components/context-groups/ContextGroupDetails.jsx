import React, { useState, useEffect } from "react";
import ContextGroupItem from "./ContextGroupItem";
import AddItemModal from "./AddItemModal";

/**
 * Component to display the details of a context group and manage items
 */
export default function ContextGroupDetails({ contextGroup, onAddItem, onRemoveItem, onBack }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contextGroup) {
      fetchItems();
    }
  }, [contextGroup]);

  const fetchItems = async () => {
    if (!contextGroup?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/context-groups/${contextGroup._id}/items`);

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching context group items:", err);
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onAddItem(contextGroup._id, itemData);
      fetchItems(); // Refresh the items list
      setAddItemModalOpen(false);
    } catch (err) {
      setError("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setError(null);

    try {
      await onRemoveItem(contextGroup._id, itemId);
      // Update the items list locally to avoid a refetch
      setItems(items.filter((item) => item._id !== itemId));
    } catch (err) {
      setError("Failed to remove item. Please try again.");
    }
  };

  if (!contextGroup) {
    return (
      <div className="flex h-60 items-center justify-center">
        <p className="text-gray-500">Select a context group to view details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-2 inline-flex items-center rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{contextGroup.name}</h2>
            {contextGroup.description && <p className="text-sm text-gray-500">{contextGroup.description}</p>}
          </div>
        </div>
        <button
          onClick={() => setAddItemModalOpen(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="-ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Items</h3>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-500">No items in this group. Add some!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <ContextGroupItem key={item._id} item={item} onRemove={handleRemoveItem} />
            ))}
          </div>
        )}
      </div>

      <AddItemModal
        isOpen={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={handleAddItem}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
