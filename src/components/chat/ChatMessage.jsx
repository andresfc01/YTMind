import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

/**
 * ChatMessage component that exactly matches ChatGPT's message design
 * Includes user, system, and assistant messages with proper styling and icons
 */
export default function ChatMessage({ role, content, isPartial = false, isFunctionCall = false }) {
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
      const match = /language-(\w+)/.exec(className || "");
      const codeIndex = Math.random().toString(36).substring(7);

      return !inline && match ? (
        <div className="relative">
          <div className="absolute right-2 top-2 z-10">
            <button
              onClick={() => handleCopyCode(String(children).replace(/\n$/, ""), codeIndex)}
              className="rounded bg-gray-700 p-1 text-xs text-white hover:bg-gray-600"
            >
              {copiedCodeIndex === codeIndex ? "¡Copiado!" : "Copiar"}
            </button>
          </div>
          <SyntaxHighlighter
            style={atomDark}
            language={match[1]}
            PreTag="div"
            className="rounded-md"
            showLineNumbers
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={`rounded bg-gray-800 px-1 py-0.5 ${className || ""}`} {...props}>
          {children}
        </code>
      );
    },
    // Otros componentes personalizados si son necesarios
  };

  return (
    <div
      className={`group border-b border-white/10 ${
        role === "assistant"
          ? isFunctionCall
            ? "bg-brand-primary/10"
            : "bg-background-secondary"
          : role === "system"
          ? "bg-brand-primary/15"
          : ""
      }`}
    >
      <div className="relative m-auto flex max-w-3xl gap-4 p-4 text-base md:gap-6 md:py-6 lg:px-0">
        {/* Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm">
          {role === "assistant" ? (
            <div
              className={`flex h-full w-full items-center justify-center rounded-sm ${
                isFunctionCall ? "bg-brand-primary/80" : "bg-brand-primary"
              } text-white`}
            >
              {isFunctionCall ? (
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
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M12 8v8" />
                  <path d="m8 12 4-4 4 4" />
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
                  className="h-5 w-5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}
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

          {/* Function call label */}
          {isFunctionCall && <div className="text-xs font-semibold text-brand-primary mb-1">Ejecución de función</div>}

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
            <div className="absolute -right-4 top-0 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleCopy}
                className="rounded p-1 text-text-secondary hover:bg-background-primary hover:text-text-primary"
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
                    <path d="M20 6 9 17l-5-5" />
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
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
