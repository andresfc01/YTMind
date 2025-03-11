"use client";

import { useState, useEffect } from "react";
import RootLayout from "@/components/layout/RootLayout";
import ChatContainer from "@/components/chat/ChatContainer";
import ChatMessage from "@/components/chat/ChatMessage";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState("");
  const [chatTitle, setChatTitle] = useState("Nuevo chat");
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Cargar el historial de chats al iniciar
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch("/api/chats");
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data.chats || []);
        } else {
          console.error("Error al cargar el historial de chats");
        }
      } catch (error) {
        console.error("Error al cargar el historial de chats:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, []);

  // Cargar agentes al iniciar
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
        } else {
          console.error("Error al cargar los agentes");
        }
      } catch (error) {
        console.error("Error al cargar los agentes:", error);
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // Cargar un chat específico
  const loadChat = async (chatId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chats/${chatId}`);

      if (response.ok) {
        const data = await response.json();
        setMessages(data.chat.messages || []);
        setChatTitle(data.chat.title);
        setCurrentChatId(chatId);
      } else {
        console.error("Error al cargar el chat");
      }
    } catch (error) {
      console.error("Error al cargar el chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Crear un nuevo chat en la base de datos
  const createNewChat = async (title, firstMessage) => {
    try {
      console.log(`Cliente: Creando nuevo chat con título "${title}"`);
      if (firstMessage) {
        console.log(`Cliente: El chat incluirá un primer mensaje de tipo "${firstMessage.role}"`);
      }

      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          messages: firstMessage ? [firstMessage] : [],
          model: "gemini-2.0-flash",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Cliente: Nuevo chat creado con ID: ${data.chat.id}`);
        setCurrentChatId(data.chat.id);

        // Actualizar el historial de chats
        setChatHistory((prevHistory) => [data.chat, ...prevHistory]);

        return data.chat.id;
      } else {
        const errorData = await response.json();
        console.error(`Cliente: Error al crear el chat. Código: ${response.status}, Detalle:`, errorData);
        return null;
      }
    } catch (error) {
      console.error("Cliente: Error al crear el chat:", error);
      return null;
    }
  };

  // Eliminar un chat
  const handleDeleteChat = async (chatId, event) => {
    // Detener la propagación para evitar que se active el chat
    if (event) {
      event.stopPropagation();
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Eliminar el chat del historial local
        setChatHistory((prevHistory) => prevHistory.filter((chat) => chat.id !== chatId));

        // Si estamos viendo el chat que se está eliminando, crear un nuevo chat
        if (currentChatId === chatId) {
          setMessages([]);
          setPartialResponse("");
          setChatTitle("Nuevo chat");
          setCurrentChatId(null);
        }
      } else {
        console.error("Error al eliminar el chat");
      }
    } catch (error) {
      console.error("Error al eliminar el chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Añadir un mensaje a un chat existente
  const addMessageToChat = async (chatId, message) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al añadir mensaje al chat:", errorData.error || response.statusText);
        throw new Error(`Error al añadir mensaje al chat: ${errorData.error || response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Error al añadir mensaje al chat:", error);
      throw error;
    }
  };

  // Manejar la selección de agentes
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);

    // Si hay un agente seleccionado, actualizar el mensaje del sistema
    const selectedAgent = agents.find((agent) => agent.id === agentId);
    if (selectedAgent && selectedAgent.systemPrompt) {
      handleSendMessage(selectedAgent.systemPrompt, "system");
    }
  };

  // Modificar handleSendMessage para incluir el agente seleccionado y manejar funciones
  const handleSendMessage = async (content, role = "user") => {
    if (!content.trim()) return;

    // Añadir mensaje al chat local con el rol especificado
    const newMessage = { role, content };

    // Si es un mensaje del sistema, actualizamos el mensaje del sistema
    // o reemplazamos el existente si ya hay uno
    if (role === "system") {
      // Buscamos si ya hay un mensaje del sistema
      const systemMessageIndex = messages.findIndex((msg) => msg.role === "system");

      if (systemMessageIndex >= 0) {
        // Reemplazamos el mensaje del sistema existente
        const updatedMessages = [...messages];
        updatedMessages[systemMessageIndex] = newMessage;
        setMessages(updatedMessages);
      } else {
        // Añadimos un nuevo mensaje del sistema
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      }

      // Guardamos el mensaje del sistema en la base de datos
      if (currentChatId) {
        try {
          // Si había un mensaje del sistema previo, lo reemplazamos
          if (systemMessageIndex >= 0) {
            // Buscamos primero el chat actual completo
            const response = await fetch(`/api/chats/${currentChatId}`);
            if (response.ok) {
              const data = await response.json();
              const chatMessages = [...data.chat.messages];

              // Reemplazamos el mensaje del sistema en el array
              const dbSystemIndex = chatMessages.findIndex((msg) => msg.role === "system");
              if (dbSystemIndex >= 0) {
                chatMessages[dbSystemIndex] = newMessage;
              } else {
                chatMessages.unshift(newMessage);
              }

              // Actualizamos todos los mensajes del chat
              await fetch(`/api/chats/${currentChatId}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: chatMessages }),
              });
            }
          } else {
            // Si no había mensaje del sistema previo, añadimos uno nuevo
            await addMessageToChat(currentChatId, newMessage);
          }
        } catch (error) {
          console.error("Error al guardar el mensaje del sistema:", error);
        }
      } else {
        // Si no hay chat activo, creamos uno nuevo con el mensaje del sistema
        try {
          // Crear con un título temporal, luego se actualizará con el primer mensaje del usuario
          const tempTitle = "Nuevo chat";
          const chatId = await createNewChat(tempTitle, newMessage);
          setCurrentChatId(chatId);
          setChatTitle(tempTitle);
        } catch (error) {
          console.error("Error al crear chat con mensaje del sistema:", error);
        }
      }

      return;
    }

    // Para mensajes que no son del sistema (usuario o asistente)
    if (role === "assistant") {
      // Para mensajes del asistente, simplemente los añadimos al chat
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Guardamos el mensaje del asistente en la base de datos si hay un chat activo
      if (currentChatId) {
        try {
          await addMessageToChat(currentChatId, newMessage);
        } catch (error) {
          console.error("Error al guardar el mensaje del asistente:", error);
        }
      }

      return;
    }

    // A partir de aquí, manejamos mensajes del usuario
    // Añadimos el mensaje del usuario a la vista
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Si es el primer mensaje del usuario, actualizamos el título
    const userMessages = messages.filter((msg) => msg.role === "user");
    const isFirstUserMessage = userMessages.length === 0;

    // Extraer un título del mensaje del usuario (primeras 30 caracteres)
    const newTitle = content.length > 30 ? content.substring(0, 30) + "..." : content;

    // Si es el primer mensaje del usuario, actualizar el título del chat
    if (isFirstUserMessage) {
      setChatTitle(newTitle);
    }

    // Preparamos los mensajes para la API (incluimos todos los mensajes actuales)
    const messagesForApi = [...messages, newMessage];
    setIsLoading(true);
    setPartialResponse("");

    try {
      // Si es un nuevo chat, crear en la base de datos
      let chatId = currentChatId;

      if (!chatId) {
        // Crear el chat en la base de datos
        chatId = await createNewChat(newTitle, newMessage);
        setCurrentChatId(chatId);
      } else {
        // Si ya existe un chat (posiblemente creado por un mensaje del sistema)
        // y este es el primer mensaje del usuario, actualizamos el título
        if (isFirstUserMessage) {
          await fetch(`/api/chats/${chatId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: newTitle }),
          });
        }

        // Añadir el mensaje del usuario al chat existente
        await addMessageToChat(chatId, newMessage);
      }

      // Obtener el agente seleccionado
      const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

      // Verificar si el agente tiene funciones asignadas
      const hasFunctions =
        selectedAgent &&
        selectedAgent.functions &&
        Array.isArray(selectedAgent.functions) &&
        selectedAgent.functions.length > 0;

      if (hasFunctions) {
        console.log(
          `Agente ${selectedAgent.name} tiene ${selectedAgent.functions.length} funciones asignadas:`,
          selectedAgent.functions.map((f) => (typeof f === "string" ? f : f.name)).join(", ")
        );

        // Primero intentamos con manejo de funciones (no streaming)
        try {
          console.log("Enviando solicitud con handleFunctions=true");
          const functionResponse = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: messagesForApi,
              temperature: selectedAgent?.temperature || 0.7,
              model: selectedAgent?.model || "gemini-2.0-flash",
              agentId: selectedAgent?.id,
              handleFunctions: true,
            }),
          });

          if (!functionResponse.ok) {
            console.error(`Error en la respuesta: ${functionResponse.status}`);
            const errorText = await functionResponse.text();
            console.error(`Detalle del error: ${errorText}`);
            throw new Error(`Error: ${functionResponse.status}`);
          }

          const functionResult = await functionResponse.json();
          console.log("Respuesta de función recibida:", functionResult);

          // Si se ejecutó una función, añadimos un mensaje indicándolo
          if (functionResult.functionCall) {
            console.log("Función ejecutada:", functionResult.functionCall.name);
            console.log("Resultado:", functionResult.functionCall.result);

            // Añadir un mensaje indicando que se ejecutó una función
            const functionMessage = {
              role: "assistant",
              content: `He ejecutado la función "${functionResult.functionCall.name}" para obtener información.`,
              isFunctionCall: true,
            };

            // Añadir el mensaje al chat local
            setMessages((prevMessages) => [...prevMessages, functionMessage]);

            // Guardar el mensaje en la base de datos
            if (chatId) {
              try {
                await addMessageToChat(chatId, functionMessage);
              } catch (error) {
                console.error("Error al guardar el mensaje de función:", error);
              }
            }

            // Añadir el mensaje con la respuesta final
            const assistantMessage = {
              role: "assistant",
              content: functionResult.response,
            };

            // Añadir el mensaje al chat local
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);

            // Guardar el mensaje en la base de datos
            if (chatId) {
              try {
                await addMessageToChat(chatId, assistantMessage);
              } catch (error) {
                console.error("Error al guardar el mensaje de respuesta:", error);
              }
            }

            // Actualizar el historial de chats
            if (chatId) {
              setChatHistory((prevHistory) =>
                prevHistory.map((chat) =>
                  chat.id === chatId
                    ? {
                        ...chat,
                        lastMessage: functionResult.response.substring(0, 50),
                        messagesCount: chat.messagesCount + 2,
                        updatedAt: new Date(),
                      }
                    : chat
                )
              );
            }

            setIsLoading(false);
            return;
          } else {
            // Si no se ejecutó ninguna función, continuamos con el streaming normal
            console.log("No se detectó llamada a función, continuando con streaming normal");
          }
        } catch (functionError) {
          console.error("Error al procesar funciones:", functionError);
          // Continuamos con el streaming normal en caso de error
        }
      }

      // Llamar a la API de chat para obtener la respuesta (streaming normal)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForApi,
          temperature: selectedAgent?.temperature || 0.7,
          model: selectedAgent?.model || "gemini-2.0-flash",
          agentId: selectedAgent?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Procesar el stream de respuesta
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        setPartialResponse(responseText);
      }

      // Añadir la respuesta completa al chat local
      const assistantMessage = { role: "assistant", content: responseText };
      const finalMessages = [...messagesForApi, assistantMessage];
      setMessages(finalMessages);
      setPartialResponse("");

      // Guardar la respuesta del asistente en la base de datos
      if (chatId) {
        await addMessageToChat(chatId, assistantMessage);
      }

      // Actualizar el historial de chats
      if (chatId) {
        setChatHistory((prevHistory) =>
          prevHistory.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  lastMessage: responseText.substring(0, 50),
                  messagesCount: chat.messagesCount + 2,
                  updatedAt: new Date(),
                }
              : chat
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Añadir mensaje de error
      const errorMessage = {
        role: "assistant",
        content: "Lo siento, he encontrado un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
      };
      setMessages([...messagesForApi, errorMessage]);

      // Guardar el mensaje de error en la base de datos
      if (currentChatId) {
        await addMessageToChat(currentChatId, errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar los clics en los botones de ejemplo
  const handleExampleClick = (exampleText) => {
    handleSendMessage(exampleText);
  };

  // Crear un nuevo chat
  const handleNewChat = () => {
    setMessages([]);
    setPartialResponse("");
    setChatTitle("Nuevo chat");
    setCurrentChatId(null);
  };

  // Editar el título del chat
  const handleEditTitle = async (newTitle) => {
    setChatTitle(newTitle);

    // Actualizar el título en la base de datos si existe
    if (currentChatId) {
      try {
        const response = await fetch(`/api/chats/${currentChatId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        });

        if (response.ok) {
          // Actualizar el título en el historial local
          setChatHistory((prevHistory) =>
            prevHistory.map((chat) => (chat.id === currentChatId ? { ...chat, title: newTitle } : chat))
          );
        } else {
          console.error("Error al actualizar el título del chat");
        }
      } catch (error) {
        console.error("Error al actualizar el título del chat:", error);
      }
    }
  };

  // Cargar un chat del historial
  const handleLoadChat = (chatId) => {
    loadChat(chatId);
  };

  return (
    <RootLayout
      chatTitle={chatTitle}
      chatHistory={chatHistory}
      isLoading={isLoading || isLoadingHistory || isLoadingAgents}
      isDeleting={isDeleting}
      onNewChat={handleNewChat}
      onDeleteChat={handleDeleteChat}
      onEditTitle={handleEditTitle}
      onLoadChat={handleLoadChat}
      currentChatId={currentChatId}
    >
      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        partialResponse={partialResponse}
        onExampleClick={handleExampleClick}
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={handleSelectAgent}
      />
    </RootLayout>
  );
}
