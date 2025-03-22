import React, { useState } from "react";
import AgentManager from "@/components/agents/AgentManager";
import ChatItem from "@/components/chat/ChatItem";
import { ContextGroupManager } from "@/components/context-groups";

/**
 * Sidebar component for chat navigation and agent selection
 */
export default function Sidebar({
  isOpen,
  setIsOpen,
  onNewChat,
  chatHistory = [],
  onLoadChat,
  onDeleteChat,
  currentChatId,
  isLoadingHistory = false,
  isDeleting = false,
  // Props de agentes
  agents = [],
  selectedAgentId = null,
  onSelectAgent = () => {},
  onCreateNewChatWithAgent,
  // Props de grupos de contexto
  contextGroups = [],
  selectedContextGroupIds = [],
  onSelectContextGroups = () => {},
  onContextGroupsChange,
}) {
  const [activeTab, setActiveTab] = useState("chats");

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
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-white/10 bg-background-primary transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0`}
    >
      {/* New chat button */}
      <div className="flex-shrink-0 border-b border-[#e5e5e5] p-2">
        <button
          onClick={onNewChat}
          type="button"
          className="flex w-full items-center gap-3 rounded-md border border-[#e5e5e5] bg-white p-3 text-sm text-[#1a1a1a] transition-colors duration-200 hover:bg-[#f5f5f5]"
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

      {/* Selector de pestaña */}
      <div className="flex border-b border-[#e5e5e5] p-2">
        <div className="flex w-full rounded-md bg-[#f0f0f0] p-1">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "chats" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#666666] hover:text-[#1a1a1a]"
            }`}
            onClick={() => setActiveTab("chats")}
          >
            Chats
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "agents" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#666666] hover:text-[#1a1a1a]"
            }`}
            onClick={() => setActiveTab("agents")}
          >
            Agentes
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "contextGroups"
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-[#666666] hover:text-[#1a1a1a]"
            }`}
            onClick={() => setActiveTab("contextGroups")}
          >
            Contextos
          </button>
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" ? (
          // Contenido de la pestaña de chats
          <div className="flex h-full flex-col p-2">
            {/* Lista de chats */}
            <div className="flex-1 space-y-1 overflow-y-auto">
              {isLoadingHistory ? (
                // Muestra un esqueleto de carga
                <div className="space-y-1 p-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 animate-pulse rounded-md bg-white/5"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              ) : chatHistory.length > 0 ? (
                // Muestra la lista de chats
                chatHistory.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === currentChatId}
                    onLoadChat={onLoadChat}
                    onDeleteChat={(id) => onDeleteChat(id)}
                    isDeleting={isDeleting}
                  />
                ))
              ) : (
                // Si no hay chats, muestra un mensaje
                <div className="flex h-full flex-col items-center justify-center py-8 px-3 text-center text-text-secondary">
                  <p>Aún no has iniciado ninguna conversación.</p>
                  <button
                    type="button"
                    className="mt-1 text-sm text-brand-primary underline-offset-4 hover:underline"
                    onClick={onNewChat}
                  >
                    Iniciar nuevo chat
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "agents" ? (
          // Pestaña de agentes
          <div className="p-2">
            <AgentManager
              selectedAgentId={selectedAgentId}
              onSelectAgent={onSelectAgent}
              onCreateNewChatWithAgent={onCreateNewChatWithAgent}
              agents={agents}
            />
          </div>
        ) : (
          // Pestaña de grupos de contexto
          <div className="p-2">
            <ContextGroupManager
              contextGroups={contextGroups}
              selectedContextGroupIds={selectedContextGroupIds}
              onSelectContextGroups={onSelectContextGroups}
              onContextGroupsChange={onContextGroupsChange}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
