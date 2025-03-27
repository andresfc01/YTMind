import React, { useState, useEffect } from "react";
import AddItemForm from "./AddItemForm";
import { getYouTubeThumbnailUrl } from "@/lib/utils/youtube";

/**
 * Modal component for displaying context group details and managing items
 */
export default function ContextGroupDetails({ isOpen, contextGroup, onAddItem, onRemoveItem, onClose, onEdit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [itemsWithDetails, setItemsWithDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contextGroup?._id) {
      fetchItemDetails();
    }
  }, [isOpen, contextGroup]);

  const fetchItemDetails = async () => {
    if (!contextGroup?._id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/context-groups/${contextGroup._id}/items`);
      if (!response.ok) throw new Error("Failed to fetch item details");

      const data = await response.json();
      setItemsWithDetails(data);
    } catch (err) {
      console.error("Error fetching item details:", err);
      setError("Failed to load item details");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const { name, description, items = [], metadata = {} } = contextGroup;

  const handleAddItem = async (itemData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onAddItem(contextGroup._id, itemData);
      // Refresh item details after adding a new item
      fetchItemDetails();
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onRemoveItem(contextGroup._id, itemId);
      // Refresh item details after removing an item
      fetchItemDetails();
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render item component based on its type
  const renderItem = (item) => {
    const { type, details } = item;

    switch (type) {
      case "video":
        return (
          <div className="flex items-center space-x-3">
            <div className="h-14 w-24 overflow-hidden rounded-md flex-shrink-0">
              <img
                src={details?.thumbnailUrl || getYouTubeThumbnailUrl(details?.videoId)}
                alt={details?.title || "Video"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/96x54?text=Video";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{details?.title || "Untitled Video"}</p>
              <p className="text-xs text-gray-500">{details?.channelTitle || "Unknown Channel"}</p>
            </div>
          </div>
        );

      case "channel":
        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 overflow-hidden rounded-full flex-shrink-0">
              <img
                src={details?.metadata?.thumbnailUrl || "https://placehold.co/40x40?text=Ch"}
                alt={details?.name || "Channel"}
                className="h-full w-full object-cover rounded-full"
                onError={(e) => {
                  e.target.src = "https://placehold.co/40x40?text=Ch";
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{details?.name || "Unknown Channel"}</p>
              <p className="text-xs text-gray-500">
                {details?.statistics?.subscriberCount
                  ? `${formatNumber(details.statistics.subscriberCount)} subscribers`
                  : "YouTube Channel"}
              </p>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <svg
                className="h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{details?.name || "Unnamed Document"}</p>
              <p className="text-xs text-gray-500">{details?.fileType ? details.fileType.toUpperCase() : "Document"}</p>
            </div>
          </div>
        );

      case "url":
        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <svg
                className="h-5 w-5 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {getFaviconAndDomain(details?.url).domain || "Website"}
              </p>
              <p className="text-xs text-gray-500 truncate">{details?.url || "Unknown URL"}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <svg
                className="h-4 w-4 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <p className="text-xs text-gray-500 truncate max-w-xs">ID: {item.id}</p>
            </div>
          </div>
        );
    }
  };

  // Format large numbers with K, M suffix
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num;
  };

  // Extract domain and favicon from URL
  const getFaviconAndDomain = (url) => {
    if (!url) return { domain: "Website", favicon: null };

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace("www.", "");
      const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

      return { domain, favicon };
    } catch (e) {
      return { domain: "Website", favicon: null };
    }
  };

  // Group items by type
  const groupItemsByType = (items) => {
    const groups = {
      video: [],
      channel: [],
      document: [],
      url: [],
      other: [],
    };

    items.forEach((item) => {
      if (groups[item.type]) {
        groups[item.type].push(item);
      } else {
        groups.other.push(item);
      }
    });

    return groups;
  };

  // Get type display name
  const getTypeLabel = (type) => {
    switch (type) {
      case "video":
        return "YouTube Videos";
      case "channel":
        return "YouTube Channels";
      case "document":
        return "Documents";
      case "url":
        return "Web Links";
      case "other":
        return "Other Items";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1) + "s";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
          <div className="bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: metadata.color || "#6366f1" }}
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
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">{name}</h2>
                    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(contextGroup)}
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
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
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-base font-medium text-gray-900 mb-3">Add New Item</h3>
                <AddItemForm onSubmit={handleAddItem} isSubmitting={isSubmitting} />
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="text-base font-medium text-gray-900">Items</h3>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-6">
                  <svg
                    className="h-8 w-8 animate-spin text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : itemsWithDetails.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">No items</p>
                  <p className="mt-1 text-sm text-gray-500">Add your first item to this group</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupItemsByType(itemsWithDetails)).map(([type, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={type} className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-800 pl-1">
                          {getTypeLabel(type)} ({items.length})
                        </h4>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                            >
                              {renderItem(item)}
                              <button
                                onClick={() => handleRemoveItem(item._id)}
                                className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                                disabled={isSubmitting}
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
