import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * Root layout component that implements ChatGPT's interface design
 * Handles responsive behavior and layout structure
 */
export default function RootLayout({
  children,
  onNewChat,
  onEditTitle,
  chatTitle,
  chatHistory = [],
  onLoadChat,
  onDeleteChat,
  isLoadingHistory = false,
  isDeleting = false,
  // Props de agentes
  agents = [],
  selectedAgentId = null,
  onSelectAgent,
  onCreateNewChatWithAgent,
  // Props de grupos de contexto
  contextGroups = [],
  selectedContextGroupIds = [],
  onSelectContextGroups,
  onContextGroupsChange,
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle initial sidebar state based on screen size
  useEffect(() => {
    setIsMounted(true);
    const isLargeScreen = window.innerWidth >= 768;
    setIsSidebarOpen(isLargeScreen);

    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Don't render anything until we're mounted (to avoid hydration issues)
  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex h-full bg-background-secondary text-text-primary antialiased">
      {/* Sidebar - fixed on desktop, sliding panel on mobile */}
      <div
        className={`
          fixed md:sticky md:top-0 inset-y-0 left-0 z-40
          w-64 md:w-64 flex-none
          h-full flex flex-col
          bg-background-primary border-r border-white/10
          transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onNewChat={onNewChat}
          chatHistory={chatHistory}
          onLoadChat={onLoadChat}
          onDeleteChat={onDeleteChat}
          currentChatId={pathname === "/" ? null : pathname.split("/").pop()}
          isLoadingHistory={isLoadingHistory}
          isDeleting={isDeleting}
          // Props de agentes
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={onSelectAgent}
          onCreateNewChatWithAgent={onCreateNewChatWithAgent}
          // Props de grupos de contexto
          contextGroups={contextGroups}
          selectedContextGroupIds={selectedContextGroupIds}
          onSelectContextGroups={onSelectContextGroups}
          onContextGroupsChange={onContextGroupsChange}
        />
      </div>

      {/* Backdrop - only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          chatTitle={chatTitle}
          onEditTitle={onEditTitle}
        />
        <main className="relative flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
