import React, { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import AgentSelector from "../agents/AgentSelector";
import { FiX, FiHash } from "react-icons/fi";

/**
 * ChatContainer component with support for context groups
 * Allows adding context via @ mentions or drag-and-drop
 */
export default function ChatContainer({
  messages = [],
  onSendMessage,
  isLoading = false,
  partialResponse = "",
  onExampleClick,
  agents = [],
  selectedAgentId = null,
  onSelectAgent = () => {},
  onEditMessage = null,
  contextGroups = [],
  children,
}) {
  const messagesEndRef = useRef(null);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [activeContextGroups, setActiveContextGroups] = useState([]);

  // Debug logging for context groups
  useEffect(() => {
    if (contextGroups.length > 0) {
      console.log(
        "Available context groups in container:",
        contextGroups.map((g) => g.name)
      );
    }

    if (activeContextGroups.length > 0) {
      console.log(
        "Active context groups:",
        activeContextGroups.map((g) => g.name)
      );
    }
  }, [contextGroups, activeContextGroups]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, partialResponse]);

  // Adjust textarea height automatically
  const adjustTextareaHeight = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  // Handle system prompt changes
  const handleSystemPromptChange = (e) => {
    const newValue = e.target.value;
    setSystemPrompt(newValue);

    // Adjust height
    adjustTextareaHeight(e);
  };

  // Handle system prompt blur event
  const handleSystemPromptBlur = () => {
    if (systemPrompt.trim() && onSendMessage && typeof onSendMessage === "function") {
      const fullSystemPrompt = buildSystemPromptWithContext(systemPrompt);
      onSendMessage(fullSystemPrompt, "system");
    }
  };

  // Handle system prompt keydown event
  const handleSystemPromptKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (systemPrompt.trim()) {
        const fullSystemPrompt = buildSystemPromptWithContext(systemPrompt);
        onSendMessage(fullSystemPrompt, "system");
        setSystemPrompt("");
        e.target.style.height = "auto";
      }
    }
  };

  // Handle message editing
  const handleEditMessage = (index, newContent) => {
    if (onEditMessage && typeof onEditMessage === "function") {
      onEditMessage(index, newContent);
    }
  };

  // Add context from a context group
  const handleAddContext = async (group) => {
    console.log("Adding context group:", group.name);
    console.log("Group details:", JSON.stringify(group).substring(0, 200));
    console.log("Group has items:", group.items ? group.items.length : 0);

    // Primero obtener los detalles de los elementos
    let enhancedGroup = { ...group };

    try {
      // Solo cargamos detalles si el grupo tiene elementos pero no tienen detalles
      if (
        group.items?.length > 0 &&
        (!group.items[0].details || Object.keys(group.items[0].details || {}).length === 0)
      ) {
        console.log("Fetching item details for group:", group.name);
        const response = await fetch(`/api/context-groups/${group._id}/items`);

        if (response.ok) {
          const itemsWithDetails = await response.json();
          console.log(`Fetched ${itemsWithDetails.length} items with details`);

          // Reemplazar los elementos con los que tienen detalles
          enhancedGroup = {
            ...group,
            items: itemsWithDetails,
          };

          console.log(
            "Enhanced group item sample:",
            enhancedGroup.items.length > 0 ? JSON.stringify(enhancedGroup.items[0]).substring(0, 200) : "No items"
          );
        } else {
          console.error("Failed to fetch item details:", await response.text());
        }
      } else {
        console.log("Group already has detailed items or no items");
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }

    // Check if this group is already active
    if (!activeContextGroups.some((g) => g._id === group._id)) {
      setActiveContextGroups((prev) => [...prev, enhancedGroup]);
    }
  };

  // Remove a context group
  const handleRemoveContext = (groupId) => {
    console.log("Removing context group:", groupId);
    setActiveContextGroups((prev) => prev.filter((g) => g._id !== groupId));
  };

  // Handle sending a message with context
  const handleSendMessageWithContext = (message, images = [], role = "user") => {
    console.log(`Sending message with ${activeContextGroups.length} active context groups and ${images.length} images`);
    if (activeContextGroups.length > 0) {
      console.log("Active context group names:", activeContextGroups.map((g) => g.name).join(", "));
      console.log("First active context group sample:", JSON.stringify(activeContextGroups[0]).substring(0, 200));
    }

    if (images.length > 0) {
      console.log(`Including ${images.length} images with the message`);
    }

    if (role === "system") {
      // For system messages, pass through as is
      onSendMessage(message, role, activeContextGroups, images);
    } else {
      // For user messages, pass the active context groups separately
      onSendMessage(message, role, activeContextGroups, images);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Welcome screen or messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome screen with improved visual hierarchy
          <div className="flex h-full flex-col items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-lg space-y-8">
              <div className="text-center">
                <h1 className="mb-3 text-4xl font-semibold text-[#1a1a1a]">YTMind</h1>
                <p className="text-sm text-[#666666]">Tu asistente personal para análisis de YouTube</p>
              </div>

              <div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-6">
                <h2 className="mb-5 text-center text-lg font-medium text-[#1a1a1a]">Sistema</h2>
                <textarea
                  value={systemPrompt}
                  onChange={handleSystemPromptChange}
                  onBlur={handleSystemPromptBlur}
                  onKeyDown={handleSystemPromptKeyDown}
                  placeholder="Escribe aquí las instrucciones del sistema para configurar el comportamiento del asistente..."
                  className="w-full rounded-lg border border-[#e5e5e5] bg-white p-3 text-[#1a1a1a] placeholder-[#999999] focus:border-[#666666] focus:ring-1 focus:ring-[#666666]"
                  rows="4"
                  style={{ resize: "none" }}
                />

                {/* Active contexts section in welcome screen */}
                {activeContextGroups.length > 0 && (
                  <div className="mt-4 rounded-lg border border-[#e5e5e5] bg-white p-3">
                    <h3 className="mb-2 text-sm font-medium text-[#1a1a1a]">Active Context Groups</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeContextGroups.map((group) => (
                        <div
                          key={group._id}
                          className="flex items-center rounded-full border px-3 py-1.5 text-sm"
                          style={{
                            backgroundColor: `${group.metadata?.color || "#6366f1"}10`,
                            borderColor: group.metadata?.color || "#6366f1",
                            color: group.metadata?.color || "#6366f1",
                          }}
                        >
                          <FiHash className="mr-1.5 h-3 w-3" />
                          <span className="mr-1">{group.name}</span>
                          <button
                            onClick={() => handleRemoveContext(group._id)}
                            className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-5 text-center text-lg font-medium text-[#1a1a1a]">Ejemplos</h2>
                <div className="grid gap-4">
                  <button
                    className="rounded-lg border border-[#e5e5e5] bg-white p-4 text-left text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                    onClick={() => onExampleClick("Analiza las tendencias actuales en contenido de YouTube.")}
                  >
                    <p className="text-sm">&quot;Analiza las tendencias actuales en contenido de YouTube.&quot;</p>
                  </button>
                  <button
                    className="rounded-lg border border-[#e5e5e5] bg-white p-4 text-left text-[#1a1a1a] transition-colors hover:bg-[#f5f5f5]"
                    onClick={() => onExampleClick("Sugiere formas de mejorar la retención de audiencia en mis videos.")}
                  >
                    <p className="text-sm">
                      &quot;Sugiere formas de mejorar la retención de audiencia en mis videos.&quot;
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Messages list with improved spacing
          <div className="px-2 sm:px-4">
            {children ? (
              <>
                {children}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="pb-32 pt-3">
                {messages.map((msg, index) => (
                  <div key={index} className="mb-4 last:mb-2">
                    <ChatMessage
                      role={msg.role}
                      content={msg.content}
                      isFunctionCall={msg.isFunctionCall || false}
                      onEditMessage={onEditMessage ? (newContent) => handleEditMessage(index, newContent) : null}
                    />
                  </div>
                ))}
                {partialResponse && (
                  <div className="mb-4">
                    <ChatMessage role="assistant" content={partialResponse} isPartial={true} />
                  </div>
                )}
                {isLoading && (
                  <div className="my-4 flex w-full justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#666666]"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input box with subtle separation */}
      <div className="sticky bottom-0 w-full border-t border-[#e5e5e5] bg-white/80 backdrop-blur-sm pb-4 pt-4 sm:pb-6">
        <div className="mx-auto flex max-w-4xl flex-col px-4">
          {/* Active context groups */}
          {activeContextGroups.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex w-full justify-between mb-1">
                <div className="py-1 pr-2 text-xs text-gray-500 flex items-center">
                  <FiHash className="h-3 w-3 mr-1" />
                  <span>Contexto activo:</span>
                </div>
                <div className="text-xs text-blue-500">
                  Haz referencia al grupo en tu pregunta para activar el contexto
                </div>
              </div>
              {activeContextGroups.map((group) => (
                <div
                  key={group._id}
                  className="group flex items-center rounded-full border px-2 py-1 text-xs shadow-sm transition-all hover:shadow bg-white"
                  style={{
                    borderColor: group.metadata?.color || "#6366f1",
                    color: group.metadata?.color || "#6366f1",
                  }}
                >
                  <div
                    className="mr-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: group.metadata?.color || "#6366f1",
                    }}
                  >
                    <FiHash className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span>{group.name}</span>
                  <button
                    onClick={() => handleRemoveContext(group._id)}
                    className="ml-1 rounded-full p-0.5 text-current opacity-60 hover:bg-gray-200 hover:opacity-100"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <ChatInput
            onSendMessage={handleSendMessageWithContext}
            disabled={isLoading}
            contextGroups={contextGroups}
            onAddContext={handleAddContext}
            activeContextGroups={activeContextGroups}
          />
        </div>
      </div>
    </div>
  );
}
