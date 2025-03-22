import React, { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";

/**
 * ChatInput component that exactly matches ChatGPT's input design
 * Includes auto-growing textarea and send button
 */
export default function ChatInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            className="w-full resize-none rounded-lg border border-white/10 bg-background-secondary p-3 pr-10 text-text-primary placeholder-text-secondary/50 focus:border-brand-primary focus:ring-brand-primary"
            rows={1}
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="absolute bottom-3 right-3 text-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            <FiSend className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
}
