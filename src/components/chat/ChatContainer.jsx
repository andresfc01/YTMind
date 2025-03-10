import React, { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

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
      e.target.blur(); // Provocar el evento blur que guardará el mensaje
    }
  };

  return (
    <div className="flex h-full flex-col bg-background-primary text-text-primary">
      {/* Important disclaimer text - moved to top for better LCP */}
      <p className="text-center text-xs text-text-secondary py-2">
        YouTube Mind puede cometer errores. Verifica la información importante.
      </p>

      {/* Campo de entrada para el prompt del sistema - visible siempre */}
      <div className="border-b border-white/10 px-4 py-2 bg-background-secondary/30">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span>Sistema:</span>
          </div>
          <div className="flex-1 relative">
            <textarea
              value={systemPrompt}
              onChange={handleSystemPromptChange}
              onBlur={handleSystemPromptBlur}
              onKeyDown={handleSystemPromptKeyDown}
              placeholder="Añade instrucciones para el asistente... (se guardarán automáticamente al presionar Enter o al quitar el foco)"
              className="w-full min-h-[32px] max-h-[100px] px-3 py-1 text-sm rounded-md border border-white/10 bg-background-primary focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none overflow-y-auto"
              rows={1}
            ></textarea>
            {messages.some((msg) => msg.role === "system") && (
              <div className="absolute right-2 top-1 text-[10px] text-green-500">✓ Instrucciones guardadas</div>
            )}
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        // Welcome screen
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-32 text-center">
          <h1 className="mb-10 text-4xl font-bold">YouTube Mind</h1>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-medium">Ejemplos</h2>
              <button
                type="button"
                className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5"
                onClick={() => onExampleClick("Analiza mi canal de YouTube y dame consejos para mejorar")}
              >
                "Analiza mi canal de YouTube y dame consejos para mejorar"
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5"
                onClick={() => onExampleClick("Genera ideas de videos para mi nicho de tecnología")}
              >
                "Genera ideas de videos para mi nicho de tecnología"
              </button>
              <button
                type="button"
                className="rounded-xl border border-white/10 p-4 text-left hover:bg-white/5"
                onClick={() => onExampleClick("Ayúdame a escribir un guión para mi próximo video")}
              >
                "Ayúdame a escribir un guión para mi próximo video"
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Chat messages
        <div className="flex-1 overflow-y-auto scrollbarthin">
          <div className="flex flex-col gap-3 px-4 py-5">
            {messages.map((message, index) => (
              <ChatMessage key={index} role={message.role} content={message.content} />
            ))}
            {partialResponse && <ChatMessage role="assistant" content={partialResponse} isPartial={true} />}
            {isLoading && !partialResponse && (
              <div className="flex items-center gap-4 px-4 py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                <span className="text-sm text-text-secondary">Pensando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="border-t border-white/10 px-4 py-2">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
