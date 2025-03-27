import React, { useState, useRef } from "react";
import { extractVideoId, extractChannelId, isYouTubeUrl } from "@/lib/utils/youtube";

/**
 * Form for adding items to a context group
 */
export default function AddItemForm({ onSubmit, isSubmitting }) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUrl(""); // Clear URL when file is selected
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setUrl(""); // Clear URL when file is selected
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Handle document upload
    if (file) {
      try {
        // Determine the file type
        let fileType = "text";
        if (file.type.includes("markdown") || file.name.endsWith(".md")) {
          fileType = "markdown";
        } else if (file.type.includes("pdf") || file.name.endsWith(".pdf")) {
          fileType = "pdf";
        } else if (file.type.includes("json") || file.name.endsWith(".json")) {
          fileType = "json";
        }

        let content;
        // Read the file content based on type
        if (fileType === "pdf") {
          // For PDFs, just store the file name and type as we can't read the content directly
          content = `PDF Document: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        } else {
          try {
            content = await readFileContent(file);
          } catch (err) {
            console.error("Error reading file:", err);
            setError("Error reading file content. Make sure it's a valid text file.");
            return;
          }
        }

        // Create document data
        const documentData = {
          name: file.name,
          description: `Uploaded on ${new Date().toLocaleString()} - ${Math.round(file.size / 1024)} KB`,
          content,
          fileType,
        };

        console.log(`Uploading ${fileType} document: ${file.name}`);
        onSubmit({ type: "document", document: documentData });

        // Reset form
        setFile(null);
        return;
      } catch (err) {
        console.error("Document processing error:", err);
        setError("Error processing document: " + err.message);
        return;
      }
    }

    // Handle URL-based content
    if (!url.trim()) {
      setError("Please enter a URL or upload a file");
      return;
    }

    // Basic URL validation
    try {
      new URL(url); // This will throw an error if the URL is invalid
    } catch (e) {
      setError("Invalid URL format");
      return;
    }

    // Auto-detect YouTube URLs
    const finalType = isYouTubeUrl(url) ? (extractVideoId(url) ? "video" : "channel") : "url";

    if ((finalType === "video" || finalType === "channel") && !isYouTubeUrl(url)) {
      setError("Not a valid YouTube URL");
      return;
    }

    if (finalType === "video" && !extractVideoId(url)) {
      setError("Could not extract video ID from the URL");
      return;
    }

    if (finalType === "channel" && !extractChannelId(url)) {
      setError("Could not extract channel ID from the URL");
      return;
    }

    // Submit the URL with the detected type
    onSubmit({ url: url.trim(), type: finalType });

    // Reset form
    setUrl("");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <input
            type="url"
            id="url"
            name="url"
            value={url}
            onChange={handleUrlChange}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Enter YouTube or web URL"
          />
        </div>

        <div
          className={`${
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
          } flex items-center justify-center cursor-pointer rounded-md border-2 border-dashed px-3 py-2 transition-colors`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-6 w-6 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-1 text-xs text-gray-500 truncate">{file ? file.name : "Drop file or click"}</p>
            <input
              type="file"
              id="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.md,.markdown,.json,.pdf"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || (!url && !file)}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Item"}
        </button>
      </div>
    </form>
  );
}
