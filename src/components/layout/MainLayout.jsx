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
    <div className="flex h-screen w-full overflow-hidden bg-[#ffffff] text-text-primary">
      {/* 
        Sidebar container - Darker background with border separation
      */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50 
          w-[260px] max-w-[260px] md:max-w-[260px]
          h-full flex-shrink-0 flex flex-col 
          bg-[#f7f7f8] border-r border-[#e5e5e5]
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* 
        Main content area - Clean white background with subtle border separation
      */}
      <div className="flex flex-1 flex-col w-full h-full overflow-hidden bg-white">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="relative flex-1 overflow-hidden border-t border-[#f0f0f0]">{children}</main>
      </div>
    </div>
  );
}
