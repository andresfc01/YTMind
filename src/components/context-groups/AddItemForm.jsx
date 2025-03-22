import React, { useState } from "react";
import { extractVideoId, extractChannelId, isYouTubeUrl } from "@/lib/utils/youtube";

/**
 * Form for adding items to a context group
 */
export default function AddItemForm({ onSubmit, isSubmitting }) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("video");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    // Basic URL validation
    try {
      new URL(url); // This will throw an error if the URL is invalid
    } catch (e) {
      setError("Invalid URL format");
      return;
    }

    // For YouTube URLs, extract the ID based on the type
    if (type === "video" || type === "channel") {
      if (!isYouTubeUrl(url)) {
        setError("Not a valid YouTube URL");
        return;
      }

      let id;
      if (type === "video") {
        id = extractVideoId(url);
        if (!id) {
          setError("Could not extract video ID from the URL");
          return;
        }
      } else if (type === "channel") {
        id = extractChannelId(url);
        if (!id) {
          setError("Could not extract channel ID from the URL");
          return;
        }
      }

      // At this point, we have a valid ID
      onSubmit({ url: url.trim(), type });
    } else {
      // For document/url types, just pass the URL
      onSubmit({ url: url.trim(), type });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Item Type
        </label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          <option value="video">YouTube Video</option>
          <option value="channel">YouTube Channel</option>
          <option value="document">Document</option>
          <option value="url">Web URL</option>
        </select>
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          placeholder={
            type === "video"
              ? "https://www.youtube.com/watch?v=VIDEO_ID"
              : type === "channel"
              ? "https://www.youtube.com/channel/CHANNEL_ID"
              : "https://example.com/page"
          }
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {type === "video"
            ? "Enter a YouTube video URL"
            : type === "channel"
            ? "Enter a YouTube channel URL"
            : type === "document"
            ? "Enter a document URL"
            : "Enter any web URL"}
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          {isSubmitting ? "Adding..." : "Add Item"}
        </button>
      </div>
    </form>
  );
}
