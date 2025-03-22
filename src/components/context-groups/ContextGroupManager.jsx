import React, { useState, useEffect } from "react";
import ContextGroupList from "./ContextGroupList";
import ContextGroupDetails from "./ContextGroupDetails";
import ContextGroupModal from "./ContextGroupModal";
import ContextGroupSelector from "./ContextGroupSelector";
import ReactDOM from "react-dom";

/**
 * Main component for managing context groups
 */
export default function ContextGroupManager({
  contextGroups = [],
  selectedContextGroupIds = [],
  onSelectContextGroups,
  onContextGroupsChange,
}) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [localContextGroups, setLocalContextGroups] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If context groups are provided via props, use them
  useEffect(() => {
    if (contextGroups && contextGroups.length > 0) {
      setLocalContextGroups(contextGroups);
    } else {
      // Otherwise fetch them from the API
      fetchContextGroups();
    }
  }, [contextGroups]);

  // Fetch all context groups
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

      // Notify parent component about the updated context groups
      if (onContextGroupsChange) {
        onContextGroupsChange(data);
      }
    } catch (err) {
      console.error("Error fetching context groups:", err);
      setError("Failed to load context groups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding an item to a context group
  const handleAddItem = async (groupId, itemData) => {
    try {
      // Convert YouTube URL to appropriate format based on type
      let itemToAdd = {
        type: itemData.type,
        id: null, // Will be populated with the DB ID after fetching/creating the item
      };

      // First, fetch or create the item in the appropriate collection based on type
      const itemResponse = await fetch(`/api/${itemData.type}s`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: itemData.url }),
      });

      if (!itemResponse.ok) {
        throw new Error(`Failed to create ${itemData.type}: ${itemResponse.status}`);
      }

      const item = await itemResponse.json();

      // Now add the item to the context group
      itemToAdd.id = item._id;

      const response = await fetch(`/api/context-groups/${groupId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToAdd),
      });

      if (!response.ok) {
        throw new Error(`Failed to add item to context group: ${response.status}`);
      }

      // Update the selected group if it was the one modified
      if (selectedGroup && selectedGroup._id === groupId) {
        const updatedGroup = await response.json();
        setSelectedGroup(updatedGroup);
      }

      return true;
    } catch (error) {
      console.error("Error adding item to context group:", error);
      throw error;
    }
  };

  // Handle removing an item from a context group
  const handleRemoveItem = async (groupId, itemId) => {
    try {
      const response = await fetch(`/api/context-groups/${groupId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to remove item from context group: ${response.status}`);
      }

      // Update the selected group if it was the one modified
      if (selectedGroup && selectedGroup._id === groupId) {
        const updatedGroup = await response.json();
        setSelectedGroup(updatedGroup);
      }

      return true;
    } catch (error) {
      console.error("Error removing item from context group:", error);
      throw error;
    }
  };

  // Handle modal closing
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGroup(null);
  };

  // Handle modal submission
  const handleSubmitModal = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      if (editingGroup) {
        // Update existing group
        response = await fetch(`/api/context-groups/${editingGroup._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new group
        response = await fetch("/api/context-groups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${editingGroup ? "update" : "create"} context group: ${response.status}`);
      }

      // Get the created/updated group data
      const data = await response.json();

      // Update the local state immediately
      if (editingGroup) {
        // Replace the updated group in the local state
        setLocalContextGroups((prevGroups) => prevGroups.map((group) => (group._id === data._id ? data : group)));
      } else {
        // Add the new group to the local state
        setLocalContextGroups((prevGroups) => [data, ...prevGroups]);
      }

      // Notify parent component about the change
      if (onContextGroupsChange) {
        // For a new group, we add it to the existing groups
        // For an updated group, we replace it in the array
        if (editingGroup) {
          onContextGroupsChange((prevGroups) => prevGroups.map((group) => (group._id === data._id ? data : group)));
        } else {
          onContextGroupsChange((prevGroups) => [data, ...prevGroups]);
        }
      }

      setModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      console.error(`Error ${editingGroup ? "updating" : "creating"} context group:`, err);
      setError(`Failed to ${editingGroup ? "update" : "create"} context group. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the modal using portal if on client side
  const renderModal = () => {
    if (!isMounted) return null;

    return ReactDOM.createPortal(
      <ContextGroupModal
        isOpen={modalOpen}
        contextGroup={editingGroup}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        isSubmitting={isSubmitting}
      />,
      document.body
    );
  };

  // Main content for selector view (in sidebar)
  const renderSelectorContent = () => (
    <div className="p-2">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Grupos de Contexto</h3>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          <svg
            className="mr-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear
        </button>
      </div>
      <p className="mb-4 text-sm text-gray-500">Selecciona grupos de contexto para usar en tu chat.</p>
      <ContextGroupSelector onSelect={onSelectContextGroups} selectedGroupIds={selectedContextGroupIds} />
    </div>
  );

  // Main content for full manager view
  const renderManagerContent = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Context Groups</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Group
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm text-gray-500">
            Context groups allow you to organize related items (videos, channels, documents, URLs) and use them together
            in chats.
          </p>
          <ContextGroupList
            contextGroups={localContextGroups}
            onSelect={setSelectedGroup}
            onEdit={(group) => {
              setEditingGroup(group);
              setModalOpen(true);
            }}
            onDelete={setGroupToDelete}
            isLoading={isLoading}
          />
        </div>
        <div>
          {selectedGroup && (
            <ContextGroupDetails
              contextGroup={selectedGroup}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onBack={() => setSelectedGroup(null)}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {onSelectContextGroups ? renderSelectorContent() : renderManagerContent()}
      {renderModal()}
    </>
  );
}
