import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

/**
 * ChatMessage component that exactly matches ChatGPT's message design
 * Includes user, system, and assistant messages with proper styling and icons
 */
export default function ChatMessage({ role, content, isPartial = false }) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  // Manejador para copiar todo el mensaje
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Manejador para copiar un bloque de código específico
  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Componentes personalizados para ReactMarkdown
  const components = {
    code({ node, inline, className, children, ...props }) {
      // Para código en línea, simplemente renderizamos el código
      if (inline) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // Para bloques de código, añadimos resaltado de sintaxis
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeIndex = props["data-index"];

      return (
        <div className="relative my-4 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-1 bg-gray-800 text-xs text-gray-300">
            <span>{language || "text"}</span>
            <button
              onClick={() => handleCopyCode(String(children).replace(/\n$/, ""), codeIndex)}
              className="px-2 py-1 text-xs rounded hover:bg-gray-700"
            >
              {copiedCodeIndex === codeIndex ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
          <SyntaxHighlighter
            {...props}
            style={atomDark}
            language={language}
            className="!mt-0"
            wrapLines
            showLineNumbers
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    },
  };

  return (
    <div
      className={`group border-b border-white/10 ${
        role === "assistant" ? "bg-background-secondary" : role === "system" ? "bg-brand-primary/15" : ""
      }`}
    >
      <div className="relative m-auto flex max-w-3xl gap-4 p-4 text-base md:gap-6 md:py-6 lg:px-0">
        {/* Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm">
          {role === "assistant" ? (
            <div className="flex h-full w-full items-center justify-center rounded-sm bg-brand-primary text-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          ) : role === "system" ? (
            <div className="flex h-full w-full items-center justify-center rounded-sm bg-brand-primary text-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-sm bg-text-primary/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>

        {/* Message content */}
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1">
          {/* Role label for system messages */}
          {role === "system" && (
            <div className="text-xs font-semibold text-brand-primary mb-1">Instrucciones del sistema</div>
          )}

          <div className={`min-h-[20px] prose prose-invert max-w-none ${role === "system" ? "font-medium" : ""}`}>
            {role === "user" ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : (
              <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            )}
            {isPartial && <span className="animateblink inline-block h-4 w-2 bg-text-primary ml-1"></span>}
          </div>

          {/* Copy button - only show for complete messages */}
          {!isPartial && (
            <button
              onClick={handleCopy}
              className="absolute -right-10 top-0 rounded-md p-1 text-text-secondary opacity-0 hover:bg-white/5 group-hover:opacity-100"
            >
              {isCopied ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
