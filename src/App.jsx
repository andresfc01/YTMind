import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/layout/Sidebar";
import ChatContainer from "./components/chat/ChatContainer";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partialResponse, setPartialResponse] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cargar agentes al iniciar
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents");
        if (!response.ok) throw new Error("Error al cargar agentes");
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        console.error("Error cargando agentes:", error);
      }
    };
    fetchAgents();
  }, []);

  const handleSendMessage = async (content, role = "user") => {
    if (!content.trim()) return;

    const newMessage = { role, content };
    setMessages((prev) => [...prev, newMessage]);

    if (role === "user") {
      setIsLoading(true);
      setPartialResponse("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, newMessage],
            agentId: selectedAgentId,
          }),
        });

        if (!response.ok) throw new Error("Error en la respuesta del chat");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedResponse += chunk;
          setPartialResponse(accumulatedResponse);
        }

        setMessages((prev) => [...prev, { role: "assistant", content: accumulatedResponse }]);
        setPartialResponse("");
      } catch (error) {
        console.error("Error en el chat:", error);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo." },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExampleClick = (example) => {
    handleSendMessage(example);
  };

  return (
    <div className="flex h-screen bg-background-primary text-text-primary">
      <Toaster />
      <Sidebar
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={setSelectedAgentId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex flex-1 flex-col">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          partialResponse={partialResponse}
          onExampleClick={handleExampleClick}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={setSelectedAgentId}
        />
      </main>
    </div>
  );
}
