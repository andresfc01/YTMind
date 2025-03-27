import React, { useState, useEffect } from "react";
import ContextGroupSelector from "./ContextGroupSelector";
import ContextGroupModal from "./ContextGroupModal";
import ContextGroupDetails from "./ContextGroupDetails";
import ReactDOM from "react-dom";

/**
 * Main component for managing context groups
 */
export default function ContextGroupManager({ contextGroups = [], onContextGroupsChange, isSidebar = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      fetchContextGroups();
    }
  }, [contextGroups]);

  const fetchContextGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/context-groups");
      if (!response.ok) throw new Error(`Failed to fetch context groups: ${response.status}`);
      const data = await response.json();
      setLocalContextGroups(data);
      if (onContextGroupsChange) onContextGroupsChange(data);
    } catch (err) {
      console.error("Error fetching context groups:", err);
      setError("Failed to load context groups. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (groupId, itemData) => {
    try {
      let itemToAdd = {
        type: itemData.type,
        id: null,
      };

      // Handle document upload
      if (itemData.type === "document" && itemData.document) {
        console.log("Processing document upload:", itemData.document.name, "type:", itemData.document.fileType);

        try {
          const documentResponse = await fetch(`/api/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(itemData.document),
          });

          const responseText = await documentResponse.text();
          console.log("Document API response:", responseText);

          if (!documentResponse.ok) {
            throw new Error(`Failed to create document: ${documentResponse.status} - ${responseText}`);
          }

          // Parse the response as JSON
          const document = JSON.parse(responseText);

          if (!document || !document._id) {
            console.error("Document response missing _id:", document);
            throw new Error("Document creation response missing _id field");
          }

          console.log("Document created successfully with ID:", document._id);
          itemToAdd.id = document._id;
        } catch (error) {
          console.error("Error creating document:", error);
          throw error;
        }
      } else {
        // Handle URL-based content (video, channel, url)

        // Make sure itemData.type is valid (temporary fix to avoid errors)
        if (!["video", "channel", "url"].includes(itemData.type)) {
          throw new Error(`Invalid item type: ${itemData.type}`);
        }

        const itemResponse = await fetch(`/api/${itemData.type}s`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: itemData.url }),
        });

        if (!itemResponse.ok) {
          const errorText = await itemResponse.text();
          throw new Error(`Failed to create ${itemData.type}: ${itemResponse.status} - ${errorText}`);
        }

        const item = await itemResponse.json();

        // Check if the item has the expected MongoDB _id field
        if (!item || !item._id) {
          throw new Error(`Response from ${itemData.type}s API is missing _id field`);
        }

        itemToAdd.id = item._id;
      }

      console.log("Adding item to context group:", itemToAdd);

      const response = await fetch(`/api/context-groups/${groupId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemToAdd),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add item to context group: ${response.status} - ${errorText}`);
      }

      const updatedGroup = await response.json();
      setLocalContextGroups((groups) => groups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)));
      setSelectedGroup(updatedGroup);

      return true;
    } catch (error) {
      console.error("Error adding item to context group:", error);
      throw error;
    }
  };

  const handleRemoveItem = async (groupId, itemId) => {
    try {
      const response = await fetch(`/api/context-groups/${groupId}/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to remove item from context group: ${response.status}`);
      }

      const updatedGroup = await response.json();
      setLocalContextGroups((groups) => groups.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)));
      setSelectedGroup(updatedGroup);

      return true;
    } catch (error) {
      console.error("Error removing item from context group:", error);
      throw error;
    }
  };

  const handleSubmitModal = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      if (editingGroup) {
        response = await fetch(`/api/context-groups/${editingGroup._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/context-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${editingGroup ? "update" : "create"} context group: ${response.status}`);
      }

      const data = await response.json();

      setLocalContextGroups((prevGroups) => {
        if (editingGroup) {
          return prevGroups.map((group) => (group._id === data._id ? data : group));
        }
        return [data, ...prevGroups];
      });

      if (onContextGroupsChange) {
        onContextGroupsChange((prevGroups) => {
          if (editingGroup) {
            return prevGroups.map((group) => (group._id === data._id ? data : group));
          }
          return [data, ...prevGroups];
        });
      }

      setCreateModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      console.error(`Error ${editingGroup ? "updating" : "creating"} context group:`, err);
      setError(`Failed to ${editingGroup ? "update" : "create"} context group. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setCreateModalOpen(true);
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setDetailsModalOpen(true);
  };

  const renderModals = () => {
    if (!isMounted) return null;

    return ReactDOM.createPortal(
      <>
        <ContextGroupModal
          isOpen={createModalOpen}
          contextGroup={editingGroup}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingGroup(null);
          }}
          onSubmit={handleSubmitModal}
          isSubmitting={isSubmitting}
        />
        {selectedGroup && (
          <ContextGroupDetails
            isOpen={detailsModalOpen}
            contextGroup={selectedGroup}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedGroup(null);
            }}
            onEdit={handleEdit}
          />
        )}
      </>,
      document.body
    );
  };

  if (isSidebar) {
    return (
      <>
        <ContextGroupSelector
          contextGroups={localContextGroups}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          isLoading={isLoading}
          error={error}
        />
        {renderModals()}
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Context Groups</h1>
          <p className="mt-1 text-sm text-gray-500">Organize your content in groups for better context management</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <svg
            className="-ml-0.5 mr-1.5 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid w-full grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : localContextGroups.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
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
        ) : (
          localContextGroups.map((group) => (
            <div
              key={group._id}
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow"
              onClick={() => handleViewDetails(group)}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: group.metadata?.color || "#6366f1" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
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
                  <h3 className="truncate text-sm font-medium text-gray-900">{group.name}</h3>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {group.items?.length || 0} {group.items?.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <div className="ml-4 flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(group);
                  }}
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
              </div>
            </div>
          ))
        )}
      </div>

      {renderModals()}
    </div>
  );
}
