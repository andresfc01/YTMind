import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiHash, FiPlusCircle, FiImage, FiX } from "react-icons/fi";

/**
 * ChatInput component with professional UX for context groups
 * Features enhanced @ mentions, visual indicators, and drag-and-drop
 */
export default function ChatInput({
  onSendMessage,
  disabled = false,
  contextGroups = [],
  onAddContext = () => {},
  activeContextGroups = [],
}) {
  const [message, setMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [dropActive, setDropActive] = useState(false);
  const [addedContextToast, setAddedContextToast] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const textareaRef = useRef(null);
  const mentionsRef = useRef(null);
  const inputContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  console.log(
    "Available context groups:",
    contextGroups.map((g) => g.name)
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Handle outside clicks to close mentions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mentionsRef.current &&
        !mentionsRef.current.contains(event.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || uploadedImages.length > 0) {
      onSendMessage(message.trim(), uploadedImages);
      setMessage("");
      setUploadedImages([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey && !showMentions) {
      e.preventDefault();
      handleSubmit(e);
      return;
    }

    // Handle mention selection with arrow keys
    if (showMentions && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter" || e.key === "Escape")) {
      if (e.key === "Escape") {
        setShowMentions(false);
        e.preventDefault();
      }
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Check for @ symbol to trigger mentions
    const lastAtPos = newValue.lastIndexOf("@");
    if (lastAtPos !== -1 && (lastAtPos === 0 || newValue[lastAtPos - 1] === " ")) {
      const textAfterAt = newValue.substring(lastAtPos + 1);
      // Show mentions only if there's no space after @
      if (!textAfterAt.includes(" ")) {
        setMentionFilter(textAfterAt.toLowerCase());
        console.log("Mention filter:", textAfterAt.toLowerCase());

        // Always show dropdown for debugging
        setShowMentions(true);

        // Simple positioning fallback
        const position = { top: 30, left: 10 };

        // Try to calculate better position if possible
        if (textareaRef.current) {
          try {
            position.top = textareaRef.current.offsetHeight;
            position.left = Math.min(lastAtPos * 8, textareaRef.current.offsetWidth - 280);
          } catch (err) {
            console.error("Error calculating mention position:", err);
          }
        }

        setMentionPosition(position);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectGroup = (group) => {
    console.log("Selected group:", group.name);
    const lastAtPos = message.lastIndexOf("@");

    // Add the context (siempre añadir el contexto independiente de cómo se seleccionó)
    onAddContext(group);

    // Display toast notification
    showAddedContextToast(group.name);

    // Si se usó @ para mencionar, reemplazar el texto
    if (lastAtPos !== -1) {
      // Replace the @mention with the selected group
      const newMessage =
        message.substring(0, lastAtPos) + `@${group.name} ` + message.substring(lastAtPos + mentionFilter.length + 1);
      setMessage(newMessage);
    } else {
      // Si se usó el botón +, añadir una referencia al final del mensaje actual
      setMessage((prev) => {
        const needsSpace = prev.length > 0 && !prev.endsWith(" ");
        return `${prev}${needsSpace ? " " : ""}@${group.name} `;
      });
    }

    setShowMentions(false);
    textareaRef.current.focus();
  };

  // Display a toast notification when context is added
  const showAddedContextToast = (groupName) => {
    // Set state to show in-component toast
    setAddedContextToast(groupName);

    // Clear after 2 seconds
    setTimeout(() => {
      setAddedContextToast(null);
    }, 2000);

    // Also create DOM element toast for global notification
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm shadow-md flex items-center z-50";
    toast.innerHTML = `
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Context added: ${groupName}
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 500);
    }, 2000);
  };

  // Handle drag over for drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setDropActive(true);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);
  };

  // Handle drop for context groups
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropActive(false);

    try {
      // First try to parse JSON data
      const jsonData = e.dataTransfer.getData("application/json");
      console.log("Drop data:", jsonData);

      if (jsonData) {
        const data = JSON.parse(jsonData);
        if (data && data.type === "context-group" && data.group) {
          console.log("Dropped group:", data.group.name);
          // Add group name to message
          setMessage((prev) => `${prev}@${data.group.name} `);

          // Add the context
          onAddContext(data.group);

          // Show confirmation toast
          showAddedContextToast(data.group.name);
          return;
        }
      }

      // Fallback to text data
      const textData = e.dataTransfer.getData("text/plain");
      if (textData) {
        console.log("Dropped text:", textData);
        // Try to find a matching context group
        const matchingGroup = contextGroups.find((g) => g.name === textData);
        if (matchingGroup) {
          setMessage((prev) => `${prev}@${matchingGroup.name} `);
          onAddContext(matchingGroup);
          showAddedContextToast(matchingGroup.name);
        }
      }
    } catch (error) {
      console.error("Error handling dropped context group:", error);
    }
  };

  // Filter context groups based on mention filter
  const filteredGroups = mentionFilter
    ? contextGroups.filter((group) => group.name.toLowerCase().includes(mentionFilter.toLowerCase()))
    : contextGroups;

  console.log(
    "Filtered groups:",
    filteredGroups.map((g) => g.name)
  );
  console.log("Show mentions:", showMentions);

  // Handle image upload
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Process each file
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);

    // Reset file input
    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => {
      const newImages = [...prev];
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newImages[index].url);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  return (
    <div className="w-full space-y-2">
      {/* Added context toast notification */}
      {addedContextToast && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-xs shadow-md flex items-center z-50">
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Contexto añadido: {addedContextToast}
        </div>
      )}

      {/* Image Previews */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          {uploadedImages.map((img, idx) => (
            <div key={idx} className="relative group">
              <div className="h-16 w-16 rounded overflow-hidden border border-gray-200">
                <img src={img.url} alt={`Uploaded ${idx}`} className="h-full w-full object-cover" />
              </div>
              <button
                onClick={() => handleRemoveImage(idx)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-90 hover:opacity-100"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div
          ref={inputContainerRef}
          className={`relative flex w-full items-end overflow-visible rounded-lg border bg-white px-3 py-2 shadow-sm transition-all ${
            dropActive ? "border-blue-400 ring-2 ring-blue-100" : "border-[#e5e5e5]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Context groups button */}
          <button
            type="button"
            onClick={() => {
              // Show a dropdown of available context groups
              setShowMentions(true);
              setMentionFilter("");
              setMentionPosition({ top: textareaRef.current?.offsetHeight || 30, left: 10 });
            }}
            className="mr-2 flex-none z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#666666] hover:bg-[#f0f0f0]"
            title="Añadir grupo de contexto"
          >
            <FiPlusCircle className="h-5 w-5" />
          </button>

          {/* Image upload button */}
          <button
            type="button"
            onClick={handleImageClick}
            className="mr-2 flex-none z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#666666] hover:bg-[#f0f0f0]"
            title="Subir imagen"
          >
            <FiImage className="h-5 w-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
            multiple
          />

          {/* Drop zone indicator overlay */}
          {dropActive && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-50 bg-opacity-80 z-10">
              <div className="flex flex-col items-center text-blue-600">
                <FiPlusCircle className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Soltar para añadir contexto</span>
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            rows="1"
            placeholder={disabled ? "Espera..." : "Escribe tu mensaje... (@ para mencionar un grupo de contexto)"}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full resize-none border-0 bg-transparent py-1 text-sm leading-6 text-[#1a1a1a] placeholder-[#999999] focus:outline-none focus:ring-0"
            style={{ height: "auto", maxHeight: "200px" }}
          />

          <button
            type="submit"
            disabled={disabled || (!message.trim() && uploadedImages.length === 0)}
            className={`ml-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all ${
              (message.trim() || uploadedImages.length > 0) && !disabled
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90"
                : "bg-[#f0f0f0] text-[#999999]"
            }`}
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>

        {/* Mentions dropdown with absolute positioning */}
        {showMentions && (
          <div
            ref={mentionsRef}
            className="absolute z-10 mt-1 max-h-60 w-64 overflow-y-auto rounded-lg border border-[#e5e5e5] bg-white shadow-lg"
            style={{
              top: mentionPosition.top + "px",
              left: mentionPosition.left + "px",
            }}
          >
            {filteredGroups.length > 0 ? (
              <div>
                <div className="border-b border-[#e5e5e5] px-3 py-2">
                  <h3 className="text-xs font-medium text-[#666666]">Grupos de contexto</h3>
                </div>
                <ul className="py-1">
                  {filteredGroups.map((group) => (
                    <li
                      key={group._id}
                      onClick={() => handleSelectGroup(group)}
                      className="flex cursor-pointer items-center px-3 py-2 hover:bg-[#f5f5f5]"
                    >
                      <div
                        className="mr-2 flex h-6 w-6 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `${group.metadata?.color || "#6366f1"}20`,
                          color: group.metadata?.color || "#6366f1",
                        }}
                      >
                        <FiHash className="h-3 w-3" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1a1a1a]">{group.name}</p>
                        {group.description && (
                          <p className="text-xs text-[#666666]">
                            {group.description.length > 30
                              ? group.description.substring(0, 30) + "..."
                              : group.description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-[#666666]">No hay grupos de contexto disponibles</p>
                <p className="mt-1 text-xs text-[#999999]">Crea grupos en la sección "Contextos" del panel lateral</p>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Optional help text */}
      <div className="flex items-center justify-between px-1 text-xs text-[#999999]">
        <span>Presiona Enter para enviar, Shift+Enter para nueva línea</span>
        <span className="flex items-center">
          <FiHash className="mr-1 h-3 w-3" />
          <span>Usa @ para añadir contexto</span>
        </span>
      </div>
    </div>
  );
}
