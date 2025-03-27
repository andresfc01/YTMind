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
  const [contextGroups, setContextGroups] = useState([]);
  const [selectedContextGroupIds, setSelectedContextGroupIds] = useState([]);
  const [isLoadingContextGroups, setIsLoadingContextGroups] = useState(true);

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

  // Cargar grupos de contexto al iniciar
  useEffect(() => {
    const fetchContextGroups = async () => {
      try {
        setIsLoadingContextGroups(true);
        console.log("Fetching context groups...");
        const response = await fetch("/api/context-groups");
        console.log("Context groups API response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Context groups loaded:", data);
          setContextGroups(data || []);
        } else {
          const errorText = await response.text();
          console.error("Error al cargar los grupos de contexto:", response.status, errorText);
        }
      } catch (error) {
        console.error("Error al cargar los grupos de contexto:", error);
      } finally {
        setIsLoadingContextGroups(false);
      }
    };

    fetchContextGroups();
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
      setIsLoadingHistory(true);

      // Ensure firstMessage is properly formatted as an object if it's a string
      const formattedFirstMessage =
        typeof firstMessage === "string"
          ? {
              role: "user",
              content: firstMessage,
              timestamp: new Date().toISOString(),
            }
          : firstMessage;

      // Make the API call to create a new chat
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          messages: [formattedFirstMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating chat: ${response.status}`);
      }

      const data = await response.json();

      // Update chat history with the new chat
      setChatHistory((prevHistory) => [
        {
          id: data.chat.id,
          title: data.chat.title,
          lastMessage: formattedFirstMessage.content.substring(0, 50),
          messagesCount: 1,
          createdAt: data.chat.createdAt,
          updatedAt: data.chat.updatedAt,
        },
        ...prevHistory,
      ]);

      return data.chat.id;
    } catch (error) {
      console.error("Error al crear nuevo chat:", error);
      return null;
    } finally {
      setIsLoadingHistory(false);
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
    // If chatId is null or undefined, don't try to add the message
    if (!chatId) {
      console.error("Cannot add message: chatId is null or undefined");
      return false;
    }

    try {
      // Make sure the message is properly formatted
      const formattedMessage =
        typeof message === "string"
          ? {
              role: "user",
              content: message,
              timestamp: new Date().toISOString(),
            }
          : message;

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: formattedMessage }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update the chat history to reflect the new message
      setChatHistory((prevHistory) =>
        prevHistory.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: formattedMessage.content.substring(0, 50),
                messagesCount: chat.messagesCount + 1,
                updatedAt: new Date(),
              }
            : chat
        )
      );

      return true;
    } catch (error) {
      console.error("Error al añadir mensaje al chat:", error);
      return false;
    }
  };

  // Manejar la selección de agentes
  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
  };

  const handleSelectContextGroups = (groupIds) => {
    setSelectedContextGroupIds(groupIds);
  };

  // Handler for when context groups are updated
  const handleContextGroupsChange = (updatedGroups) => {
    // If updatedGroups is a function, call it with the current contextGroups
    if (typeof updatedGroups === "function") {
      setContextGroups((prevGroups) => updatedGroups(prevGroups));
    } else {
      // Otherwise, set the context groups to the new value
      setContextGroups(updatedGroups);
    }
  };

  // La funcionalidad principal de envío de mensajes
  const handleSendMessage = async (content, role = "user", activeContextGroups = []) => {
    if (!content.trim()) return;

    try {
      // Crear un nuevo mensaje
      const newMessage = {
        role,
        content,
        timestamp: new Date().toISOString(),
      };

      // Variable para guardar el ID del chat (ya sea existente o nuevo)
      let chatIdToUse = currentChatId;

      // Si estamos creando un nuevo chat
      if (!currentChatId) {
        // Agregar mensaje al estado inmediatamente para que sea visible
        if (role !== "system") {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        const chatId = await createNewChat("Nuevo chat", newMessage);
        if (!chatId) {
          // If chat creation failed, show an error message and stop
          console.error("Failed to create a new chat");
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              role: "assistant",
              content: "Error: No se pudo crear un nuevo chat. Por favor, inténtalo de nuevo.",
              timestamp: new Date().toISOString(),
            },
          ]);
          return;
        }
        // Guardar el ID localmente para esta función además de actualizar el estado
        chatIdToUse = chatId;
        setCurrentChatId(chatId);
      } else {
        // Si el mensaje no es del sistema, agregarlo al estado
        if (role !== "system") {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }

        // Guardar el mensaje en la base de datos
        const success = await addMessageToChat(chatIdToUse, newMessage);
        if (!success) {
          console.error("Failed to add message to chat");
          return;
        }
      }

      // Si el mensaje no es de usuario, no necesitamos una respuesta
      if (role !== "user") {
        return;
      }

      // Preparar para recibir la respuesta
      setIsLoading(true);
      setPartialResponse("");

      // Obtener todos los mensajes para enviar al API
      const allMessages = [...messages, newMessage];

      // Preparar datos para el API
      const apiData = {
        messages: allMessages,
        contextGroups: activeContextGroups,
        temperature: 0.7,
        model: "gemini-2.0-flash",
        useMarkdown: true,
        useThinking: true,
      };

      // Si hay un agente seleccionado, incluirlo
      if (selectedAgentId) {
        apiData.agentId = selectedAgentId;

        // Si el agente tiene funciones, agregarlas
        const selectedAgent = agents.find((a) => a.id === selectedAgentId);
        if (selectedAgent && selectedAgent.functions && selectedAgent.functions.length > 0) {
          apiData.functions = selectedAgent.functions;
        }
      }

      try {
        // Realizar la solicitud a la API
        console.time("api-chat-request");
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });
        console.timeEnd("api-chat-request");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error en la solicitud al API");
        }

        // El nuevo endpoint siempre devuelve un stream
        // Procesar el stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let accumulatedResponse = "";
        let chunkCount = 0;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (value) {
            const textChunk = decoder.decode(value, { stream: true });
            accumulatedResponse += textChunk;
            setPartialResponse(accumulatedResponse);
            chunkCount++;
          }
        }

        // Cuando termina el streaming, agregamos el mensaje completo
        if (accumulatedResponse) {
          console.log("Received complete response - first 100 chars:", accumulatedResponse.substring(0, 100));

          const assistantMessage = {
            role: "assistant",
            content: accumulatedResponse,
            timestamp: new Date().toISOString(),
          };

          setMessages((prevMessages) => [...prevMessages, assistantMessage]);

          // Usar el ID local en lugar del estado que podría no estar actualizado
          await addMessageToChat(chatIdToUse, assistantMessage);
        }
      } catch (error) {
        console.error("Error al comunicarse con la API:", error);
        // Añadir mensaje de error al chat
        const errorMessage = {
          role: "assistant",
          content: `Error: ${error.message || "Ha ocurrido un error al comunicarse con el API."}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);

        // Usar el ID local en lugar del estado que podría no estar actualizado
        await addMessageToChat(chatIdToUse, errorMessage);
      } finally {
        setIsLoading(false);
        setPartialResponse("");
      }
    } catch (error) {
      console.error("Error general en handleSendMessage:", error);
      setIsLoading(false);
      setPartialResponse("");
    }
  };

  // Manejar los clics en los botones de ejemplo
  const handleExampleClick = (exampleText) => {
    handleSendMessage(exampleText);
  };

  // Crear un nuevo chat
  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setChatTitle("Nuevo chat");
    setSelectedAgentId(null);
  };

  // Función para editar un mensaje existente
  const handleEditMessage = async (index, newContent) => {
    try {
      // Actualizar mensaje en el estado local
      const updatedMessages = [...messages];
      updatedMessages[index].content = newContent;
      setMessages(updatedMessages);

      // Actualizar en la base de datos si existe un chat actual
      if (currentChatId) {
        await fetch(`/api/chats/${currentChatId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: updatedMessages }),
        });
      }
    } catch (error) {
      console.error("Error al editar el mensaje:", error);
    }
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

  // Crear un nuevo chat con un agente específico
  const handleCreateNewChatWithAgent = async (agentId) => {
    // Limpiar chat actual
    setMessages([]);
    setCurrentChatId(null);
    setChatTitle("Nuevo chat");

    // Establecer el agente seleccionado
    setSelectedAgentId(agentId);

    // Obtener el agente seleccionado
    const selectedAgent = agents.find((a) => a.id === agentId);

    // Si el agente tiene un mensaje de sistema, enviar ese mensaje primero
    if (selectedAgent && selectedAgent.systemPrompt) {
      // Enviar el mensaje de sistema
      await handleSendMessage(selectedAgent.systemPrompt, "system");
    }
  };

  return (
    <RootLayout
      onNewChat={handleNewChat}
      onEditTitle={handleEditTitle}
      chatTitle={chatTitle}
      chatHistory={chatHistory}
      onLoadChat={handleLoadChat}
      onDeleteChat={handleDeleteChat}
      isLoadingHistory={isLoadingHistory}
      isDeleting={isDeleting}
      // Props de agentes
      agents={agents}
      selectedAgentId={selectedAgentId}
      onSelectAgent={handleSelectAgent}
      onCreateNewChatWithAgent={handleCreateNewChatWithAgent}
      // Props de grupos de contexto
      contextGroups={contextGroups}
      selectedContextGroupIds={selectedContextGroupIds}
      onSelectContextGroups={handleSelectContextGroups}
      onContextGroupsChange={handleContextGroupsChange}
    >
      <ChatContainer
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        partialResponse={partialResponse}
        onExampleClick={handleExampleClick}
        onEditMessage={handleEditMessage}
        contextGroups={contextGroups}
      />
    </RootLayout>
  );
}
