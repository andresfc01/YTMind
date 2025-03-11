import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Estilos para el contenido de Markdown
const markdownStyles = {
  paragraph: "mb-4 leading-relaxed",
  heading: "mt-6 mb-4 font-semibold",
  list: "my-4 pl-8",
  listItem: "mb-2",
  blockquote: "border-l-3 border-gray-300 pl-5 py-1 my-4 text-gray-600",
  pre: "my-4",
  code: "font-mono",
  table: "border-collapse my-4 w-full",
  tableCell: "border border-gray-300 p-2",
  tableHeader: "bg-gray-100",
  link: "text-blue-600 underline",
  hr: "my-6 border-t border-gray-300",
};

/**
 * ChatMessage component that exactly matches ChatGPT's message design
 * Includes user, system, and assistant messages with proper styling and icons
 */
export default function ChatMessage({
  role,
  content,
  isPartial = false,
  isFunctionCall = false,
  onEditMessage = null, // Nueva prop para la función de edición
}) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isThinking, setIsThinking] = useState(false);
  const [processedContent, setProcessedContent] = useState(content);
  const [thinkingContent, setThinkingContent] = useState("");
  const [showThinking, setShowThinking] = useState(false);

  // Process content to handle thinking tags when component mounts or content changes
  useEffect(() => {
    if (role === "assistant") {
      const thinkTagOpen = content.indexOf("<think>");
      const thinkTagClose = content.indexOf("</think>");

      // If we have both opening and closing tags
      if (thinkTagClose > thinkTagOpen && thinkTagOpen !== -1) {
        // Extract the thinking content
        const thinking = content.substring(thinkTagOpen + 7, thinkTagClose); // 7 is length of "<think>"
        // Extract content after the thinking section
        const afterThinking = content.substring(thinkTagClose + 8); // 8 is length of "</think>"

        // Format thinking content but preserve intended structure
        // This keeps the Chain of Draft format intact
        const formattedThinking = thinking.trim();

        setThinkingContent(formattedThinking);
        setProcessedContent(afterThinking);
        setIsThinking(false);
      }
      // If we only have opening tag (still thinking)
      else if (thinkTagOpen !== -1 && thinkTagClose === -1) {
        // Extract the thinking content so far
        const thinking = content.substring(thinkTagOpen + 7); // 7 is length of "<think>"
        setThinkingContent(thinking);
        setIsThinking(true);
        setProcessedContent(""); // Hide content while thinking
      }
      // No thinking tags, show normal content
      else {
        setProcessedContent(content);
        setIsThinking(false);
        setThinkingContent("");
      }
    } else {
      // For non-assistant messages, just show the content as is
      setProcessedContent(content);
    }
  }, [content, role]);

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

  // Manejar el inicio de la edición
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedContent(content);
  };

  // Manejar la cancelación de la edición
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Manejar el guardado de la edición
  const handleSaveEdit = () => {
    if (onEditMessage && editedContent.trim() !== "") {
      onEditMessage(editedContent);
      setIsEditing(false);
    }
  };

  // Manejador para cambios en el contenido editado
  const handleEditChange = (e) => {
    setEditedContent(e.target.value);
  };

  // Manejador para teclas en el textarea de edición
  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Toggle visibility of thinking content
  const toggleThinking = () => {
    setShowThinking(!showThinking);
  };

  // Componentes personalizados para ReactMarkdown con mejor espaciado
  const components = {
    p: ({ node, children }) => <p className={markdownStyles.paragraph}>{children}</p>,
    h1: ({ node, children }) => <h1 className={`text-2xl ${markdownStyles.heading}`}>{children}</h1>,
    h2: ({ node, children }) => <h2 className={`text-xl ${markdownStyles.heading}`}>{children}</h2>,
    h3: ({ node, children }) => <h3 className={`text-lg ${markdownStyles.heading}`}>{children}</h3>,
    h4: ({ node, children }) => <h4 className={`text-base ${markdownStyles.heading}`}>{children}</h4>,
    h5: ({ node, children }) => <h5 className={`text-sm ${markdownStyles.heading}`}>{children}</h5>,
    h6: ({ node, children }) => <h6 className={`text-xs ${markdownStyles.heading}`}>{children}</h6>,
    ul: ({ node, children }) => <ul className={`list-disc ${markdownStyles.list}`}>{children}</ul>,
    ol: ({ node, children }) => <ol className={`list-decimal ${markdownStyles.list}`}>{children}</ol>,
    li: ({ node, children }) => <li className={markdownStyles.listItem}>{children}</li>,
    blockquote: ({ node, children }) => <blockquote className={markdownStyles.blockquote}>{children}</blockquote>,
    table: ({ node, children }) => <table className={markdownStyles.table}>{children}</table>,
    th: ({ node, children }) => (
      <th className={`${markdownStyles.tableCell} ${markdownStyles.tableHeader}`}>{children}</th>
    ),
    td: ({ node, children }) => <td className={markdownStyles.tableCell}>{children}</td>,
    a: ({ node, href, children }) => (
      <a href={href} className={markdownStyles.link} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    hr: () => <hr className={markdownStyles.hr} />,
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeIndex = Math.random().toString(36).substring(7);

      return !inline && match ? (
        <div className="relative my-4 group">
          <div className="absolute right-2 top-2 z-20">
            <button
              onClick={() => handleCopyCode(String(children).replace(/\n$/, ""), codeIndex)}
              className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600 shadow-md opacity-100"
            >
              {copiedCodeIndex === codeIndex ? "¡Copiado!" : "Copiar código"}
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
  };

  // Determinar colores y alineación según el rol
  const isUser = role === "user";
  const messageAlignment = isUser ? "justify-end" : "justify-start";
  const avatarOrder = isUser ? "order-2" : "order-1";
  const contentOrder = isUser ? "order-1" : "order-2";

  // Determinar color de fondo según el rol - usando colores más sutiles
  let bgColor = "";
  if (isUser) {
    bgColor = "bg-blue-50"; // Azul muy sutil para el usuario
  } else if (role === "assistant") {
    bgColor = isFunctionCall ? "bg-brand-primary/5" : "bg-gray-50"; // Gris muy claro para asistente
  } else if (role === "system") {
    bgColor = "bg-brand-primary/5"; // Color muy sutil para mensajes del sistema
  }

  // Estilos para los bordes de los mensajes (estilo burbuja)
  const bubbleStyle = isUser
    ? "rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-sm"
    : "rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-sm";

  return (
    <div className={`group py-1.5 ${isUser ? "bg-transparent" : "bg-transparent"}`}>
      <div className={`relative m-auto flex max-w-3xl ${messageAlignment} gap-2 text-base`}>
        {/* Avatar - solo visible en hover para mensajes del usuario */}
        <div
          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center ${avatarOrder} ${
            isUser ? "opacity-0 group-hover:opacity-100" : ""
          }`}
        >
          {role === "assistant" ? (
            <div
              className={`flex h-full w-full items-center justify-center rounded-sm ${
                isFunctionCall ? "bg-brand-primary/80" : "bg-brand-primary"
              } text-white`}
            >
              {isFunctionCall ? (
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
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M12 8v8" />
                  <path d="m8 12 4-4 4 4" />
                </svg>
              ) : (
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </div>
          ) : role === "system" ? (
            <div className="flex h-full w-full items-center justify-center rounded-sm bg-brand-primary text-white">
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-sm bg-text-primary/10">
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
            </div>
          )}
        </div>

        {/* Message content */}
        <div className={`relative flex ${contentOrder} w-auto max-w-[75%] flex-col gap-2`}>
          {/* Role label for system messages */}
          {role === "system" && (
            <div className="text-xs font-semibold text-brand-primary mb-2">Instrucciones del sistema</div>
          )}

          {/* Function call label */}
          {isFunctionCall && <div className="text-xs font-semibold text-brand-primary mb-2">Ejecución de función</div>}

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editedContent}
                onChange={handleEditChange}
                onKeyDown={handleEditKeyDown}
                className="min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-gray-800"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded bg-brand-primary px-2 py-1 text-sm text-white hover:bg-brand-primary/90"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`min-h-[20px] ${bubbleStyle} ${bgColor} p-4 shadow-sm prose prose-invert max-w-none ${
                role === "system" ? "font-medium" : ""
              }`}
            >
              {isThinking ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-brand-primary">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span className="font-medium">Thinking...</span>
                    {thinkingContent && (
                      <button
                        onClick={toggleThinking}
                        className="ml-2 text-xs bg-brand-primary/10 hover:bg-brand-primary/20 px-2 py-1 rounded-full text-brand-primary transition-colors"
                      >
                        {showThinking ? "Hide reasoning" : "Show reasoning"}
                      </button>
                    )}
                  </div>

                  {showThinking && thinkingContent && (
                    <div className="mt-4 ml-6 border-l-2 border-brand-primary/30 pl-4 text-sm text-gray-700 bg-gray-50 rounded-r-md p-3 whitespace-pre-line">
                      {thinkingContent}
                    </div>
                  )}
                </div>
              ) : role === "user" ? (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{processedContent}</div>
              ) : (
                <div className="text-gray-800">
                  {/* If we have thinking content but we're not in thinking mode, it means reasoning is complete */}
                  {thinkingContent && !isThinking && (
                    <div className="mb-3 flex items-center">
                      <button
                        onClick={toggleThinking}
                        className="text-xs bg-brand-primary/10 hover:bg-brand-primary/20 px-2 py-1 rounded-full text-brand-primary flex items-center gap-1 transition-colors"
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
                          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                        {showThinking ? "Hide reasoning process" : "Show reasoning process"}
                      </button>
                    </div>
                  )}

                  {showThinking && thinkingContent && !isThinking && (
                    <div className="mb-5 border-l-2 border-brand-primary/40 pl-4 py-3 pr-3 text-sm text-gray-700 bg-gray-50 rounded-r-md whitespace-pre-line">
                      <p className="mb-3 font-medium text-brand-primary">Reasoning Process:</p>
                      <div className="reasoning-content">
                        {/* Format the reasoning content with special handling for steps */}
                        {thinkingContent.split("\n").map((line, index) => {
                          // Check if the line is a step (starts with "Step" or contains "step")
                          if (line.trim().match(/^Step\s+\d+:/) || line.trim().match(/^For step\s+\d+:/)) {
                            return (
                              <div
                                key={index}
                                className={
                                  line.trim().startsWith("For")
                                    ? "ml-4 mt-2 text-gray-800"
                                    : "font-medium text-gray-900 mt-2"
                                }
                              >
                                {line}
                              </div>
                            );
                          } else {
                            return (
                              <div key={index} className={line.trim() === "" ? "h-2" : ""}>
                                {line}
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}

                  <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                    {processedContent}
                  </ReactMarkdown>
                </div>
              )}
              {isPartial && !isThinking && (
                <span className="animateblink inline-block h-4 w-2 bg-text-primary ml-1"></span>
              )}
            </div>
          )}

          {/* Action buttons */}
          {!isPartial && !isEditing && !isThinking && (
            <div className="flex gap-1 justify-end opacity-0 transition-opacity group-hover:opacity-100">
              {/* Edit button */}
              {onEditMessage && (
                <button
                  onClick={handleStartEdit}
                  className="rounded p-1 text-text-secondary hover:bg-background-primary hover:text-text-primary"
                  title="Editar mensaje"
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="rounded p-1 text-text-secondary hover:bg-background-primary hover:text-text-primary"
                title="Copiar al portapapeles"
              >
                {isCopied ? (
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
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
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
