import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * Main layout component for the application
 * Implements a design that closely resembles ChatGPT's interface
 */
export default function MainLayout({ children }) {
  // Initialize sidebar as open by default on larger screens, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-chatgpt-main text-text-primary">
      {/* 
        Sidebar container - ChatGPT uses approximately 260px width for sidebar
        On mobile, it becomes a sliding panel that overlays the content
      */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50 
          w-[260px] max-w-[260px] md:max-w-[260px]
          h-full flex-shrink-0 flex flex-col 
          bg-chatgpt-sidebar border-r border-chatgpt-border
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay - only visible when sidebar is open on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={toggleSidebar} aria-hidden="true" />
      )}

      {/* 
        Main content area - matches ChatGPT's layout proportions
        Takes all remaining width after the fixed-width sidebar
      */}
      <div className="flex flex-1 flex-col w-full h-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="relative flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
