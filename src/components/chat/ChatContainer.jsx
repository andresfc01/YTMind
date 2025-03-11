import React, { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import AgentSelector from "../agents/AgentSelector";

/**
 * ChatContainer component that exactly matches ChatGPT's chat interface design
 * Includes welcome screen, messages list, and input box
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
  children,
}) {
  const messagesEndRef = useRef(null);
  const [systemPrompt, setSystemPrompt] = useState("");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, partialResponse]);

  // Ajustar automáticamente la altura del textarea
  const adjustTextareaHeight = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  // Manejar el cambio en el input del sistema
  const handleSystemPromptChange = (e) => {
    const newValue = e.target.value;
    setSystemPrompt(newValue);

    // Ajustar altura
    adjustTextareaHeight(e);
  };

  // Manejar el evento onBlur para guardar el mensaje del sistema cuando el usuario termina de escribir
  const handleSystemPromptBlur = () => {
    if (systemPrompt.trim() && onSendMessage && typeof onSendMessage === "function") {
      onSendMessage(systemPrompt, "system");
    }
  };

  // Manejar el evento de teclado para guardar con Enter
  const handleSystemPromptKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (systemPrompt.trim()) {
        onSendMessage(systemPrompt, "system");
        setSystemPrompt("");
        e.target.style.height = "auto";
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Welcome screen or messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        {messages.length === 0 ? (
          // Welcome screen with improved visual hierarchy
          <div className="flex h-full flex-col items-center justify-center">
            <div className="w-full max-w-lg space-y-6">
              <div className="text-center">
                <h1 className="mb-2 text-4xl font-semibold text-[#1a1a1a]">YTMind</h1>
                <p className="text-sm text-[#666666]">Tu asistente personal para análisis de YouTube</p>
              </div>

              <div className="rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] p-6">
                <h2 className="mb-4 text-center text-lg font-medium text-[#1a1a1a]">Sistema</h2>
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
              </div>

              <div>
                <h2 className="mb-4 text-center text-lg font-medium text-[#1a1a1a]">Ejemplos</h2>
                <div className="grid gap-3">
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
          <>
            {children ? (
              <>
                {children}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="pb-32 pt-5">
                {messages.map((msg, index) => (
                  <div key={index} className="mb-8 last:mb-0">
                    <ChatMessage role={msg.role} content={msg.content} isFunctionCall={msg.isFunctionCall || false} />
                  </div>
                ))}
                {partialResponse && (
                  <div className="mb-8">
                    <ChatMessage role="assistant" content={partialResponse} isPartial={true} />
                  </div>
                )}
                {isLoading && (
                  <div className="my-8 flex w-full justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#666666]"></div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Input box with subtle separation */}
      <div className="fixed bottom-0 left-0 w-full border-t border-[#e5e5e5] bg-white/80 backdrop-blur-sm pb-4 pt-4 sm:pb-6">
        <div className="mx-auto flex max-w-4xl px-4">
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={isLoading}
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={onSelectAgent}
          />
        </div>
      </div>
    </div>
  );
}
