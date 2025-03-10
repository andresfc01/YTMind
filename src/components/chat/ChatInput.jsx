import React, { useState, useRef, useEffect } from "react";

/**
 * ChatInput component that exactly matches ChatGPT's input design
 * Includes auto-growing textarea and send button
 */
export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set new height based on scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      // Reset textarea height
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
    <form onSubmit={handleSubmit} className="relative flex w-full flex-col" role="form" aria-label="Message input form">
      <div className="relative flex w-full flex-grow flex-col rounded-xl border border-white/10 bg-background-primary shadow-[0_0_15px_rgba(0,0,0,0.10)]">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message YouTube Mind..."
          rows="1"
          className="m-0 w-full resize-none border-0 bg-transparent p-3 pr-10 focus:ring-0 focus-visible:ring-0 md:py-4 md:pl-4"
          style={{
            maxHeight: "200px",
            height: "52px",
            overflowY: "hidden",
          }}
          disabled={disabled}
          aria-label="Message input"
          aria-multiline="true"
          aria-disabled={disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="absolute bottom-2.5 right-3 rounded-lg p-1 text-text-primary hover:bg-white/5 disabled:hover:bg-transparent md:bottom-3 md:right-4"
          aria-label="Send message"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-5 w-5 ${
              message.trim() && !disabled ? "text-brand-primary" : "text-text-secondary"
            } transition-colors`}
            aria-hidden="true"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
