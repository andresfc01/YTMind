import React from "react";
import AddItemForm from "./AddItemForm";

/**
 * Modal wrapper for AddItemForm
 */
export default function AddItemModal({ isOpen, onClose, onSubmit, groupId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Add Item to Context Group</h2>

        <AddItemForm
          onSubmit={(itemData) => {
            onSubmit(groupId, itemData);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
