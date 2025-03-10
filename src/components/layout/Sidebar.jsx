import React, { useState } from "react";

/**
 * Componente para renderizar un ítem de chat con su botón de eliminar
 */
const ChatItem = ({ chat, onLoadChat, onDeleteChat, isDeleting }) => {
  // Estado para controlar el hover manual
  const [isHovering, setIsHovering] = useState(false);

  // Manejadores de eventos para el hover
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-white/10 ${
        isHovering ? "bg-white/5" : ""
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        className="h-4 w-4 shrink-0 text-text-secondary"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* Botón para cargar el chat (ocupa la mayor parte del espacio) */}
      <button
        type="button"
        className="flex-1 text-left truncate py-1"
        onClick={() => onLoadChat(chat.id)}
        aria-label={`Cargar chat: ${chat.title}`}
      >
        <span className="block truncate">{chat.title}</span>
      </button>

      {/* Botón de eliminar (papelera) - Visible condicionalmente */}
      {isHovering && (
        <button
          type="button"
          className="flex items-center justify-center h-8 w-8 rounded-md text-text-secondary hover:text-white hover:bg-red-500/30 transition-colors duration-150 ease-in-out"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteChat(chat.id, e);
          }}
          disabled={isDeleting}
          aria-label="Eliminar chat"
          title="Eliminar chat"
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
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Sidebar component that exactly matches ChatGPT's sidebar design
 * Includes chat history, folder organization, and settings
 */
export default function Sidebar({
  onNewChat,
  chatHistory = [],
  onLoadChat,
  onDeleteChat,
  isLoading = false,
  isDeleting = false,
}) {
  // Agrupar chats por fecha
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todayChats = chatHistory.filter((chat) => new Date(chat.createdAt).toDateString() === today);
  const yesterdayChats = chatHistory.filter((chat) => new Date(chat.createdAt).toDateString() === yesterday);
  const olderChats = chatHistory.filter((chat) => {
    const chatDate = new Date(chat.createdAt).toDateString();
    return chatDate !== today && chatDate !== yesterday;
  });

  return (
    <div className="flex h-full w-full flex-col bg-background-primary">
      {/* New chat button */}
      <div className="flex-shrink-0 p-2">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md border border-white/10 p-3 text-sm transition-colors duration-200 hover:bg-white/5"
          onClick={onNewChat}
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
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nuevo chat</span>
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto scrollbarthin p-2">
        {isLoading ? (
          // Indicador de carga
          <div className="flex flex-col items-center justify-center h-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white mb-2"></div>
            <span className="text-sm text-text-secondary">Cargando chats...</span>
          </div>
        ) : chatHistory.length === 0 ? (
          // Mensaje cuando no hay chats
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <span className="text-sm text-text-secondary">No hay chats guardados</span>
            <span className="text-xs text-text-secondary mt-1">Inicia una nueva conversación</span>
          </div>
        ) : (
          // Lista de chats agrupados por fecha
          <>
            {/* Today's chats */}
            {todayChats.length > 0 && (
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between px-2">
                  <h2 id="today-chats" className="text-xs font-medium uppercase text-text-secondary">
                    Hoy
                  </h2>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary hover:bg-white/5"
                    aria-expanded="true"
                    aria-labelledby="today-chats"
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
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1">
                  {todayChats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      onLoadChat={onLoadChat}
                      onDeleteChat={onDeleteChat}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday's chats */}
            {yesterdayChats.length > 0 && (
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between px-2">
                  <h2 id="yesterday-chats" className="text-xs font-medium uppercase text-text-secondary">
                    Ayer
                  </h2>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary hover:bg-white/5"
                    aria-expanded="true"
                    aria-labelledby="yesterday-chats"
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
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1">
                  {yesterdayChats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      onLoadChat={onLoadChat}
                      onDeleteChat={onDeleteChat}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older chats */}
            {olderChats.length > 0 && (
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between px-2">
                  <h2 id="older-chats" className="text-xs font-medium uppercase text-text-secondary">
                    Anteriores
                  </h2>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-md text-text-secondary hover:bg-white/5"
                    aria-expanded="true"
                    aria-labelledby="older-chats"
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
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-1">
                  {olderChats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      onLoadChat={onLoadChat}
                      onDeleteChat={onDeleteChat}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t border-white/10 p-2">
        <div className="space-y-2">
          {/* Settings button */}
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-white/5"
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
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Configuración</span>
          </button>

          {/* Logout button */}
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-white/5"
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
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
