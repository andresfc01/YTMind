import React, { useState } from "react";

/**
 * Header component that exactly matches ChatGPT's header design
 * Includes mobile menu toggle, chat title, and action buttons
 */
export default function Header({ isSidebarOpen, onToggleSidebar, chatTitle = "Nuevo chat", onEditTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(chatTitle);

  const handleEditClick = () => {
    setEditedTitle(chatTitle);
    setIsEditing(true);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onEditTitle(editedTitle);
    } else {
      setEditedTitle(chatTitle);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setEditedTitle(chatTitle);
      setIsEditing(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-white/10 bg-background-secondary px-3 py-2 md:px-4">
      {/* Left section: Mobile menu and chat title */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5 md:hidden"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="h-5 w-5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isSidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Chat title */}
        <h1 className="flex items-center gap-2 text-base">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={handleKeyDown}
              className="w-48 rounded-md border border-white/10 bg-background-primary px-2 py-1 text-sm focus:border-brand-primary focus:outline-none"
              autoFocus
            />
          ) : (
            <span className="truncate max-w-[200px]">{chatTitle}</span>
          )}
          {!isEditing && (
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary hover:bg-white/5"
              onClick={handleEditClick}
              aria-label="Editar título"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
        </h1>
      </div>

      {/* Right section: Share and user menu */}
      <div className="flex items-center gap-2">
        {/* Share button */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5"
          aria-label="Compartir chat"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        {/* User menu */}
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5"
          aria-label="Menú de usuario"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </header>
  );
}
