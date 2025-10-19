import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Sidebar from "./pages/Sidebar";
import { Home, CircleUser, Plus, Zap, TvMinimal } from "lucide-react";

const NAVBAR_HEIGHT = 64;

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#b7b7b7] relative overflow-hidden">
      {/* Sidebar (always full height & above navbar) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 transition-all duration-300 bg-[#042d52] shadow-lg ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
      </aside>

      {/* Navbar (below sidebar visually) */}
      <header
        className="fixed top-0 left-0 right-0 bg-[#b7b7b7] z-40"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <Navbar
          onSearch={setSearchQuery}
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </header>

      {/* Main content area */}
      <main
        className={`transition-all duration-300 overflow-y-auto`}
        style={{
          marginLeft: isSidebarCollapsed ? 64 : 256, // same as sidebar width
          paddingTop: NAVBAR_HEIGHT,
          minHeight: "100vh",
        }}
      >
        <div className="p-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 flex justify-around items-center py-2 z-40">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <Home size={22} />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => navigate("/dashboard/short-page")}
          className="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <Zap size={22} />
          <span className="text-xs">Shorts</span>
        </button>
        <button
          onClick={() => navigate("/dashboard/upload-video")}
          className="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <Plus className="bg-[#3f3e3e] p-1 rounded-full" size={32} />
        </button>
        <button
          onClick={() => navigate("/dashboard/subscription")}
          className="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <TvMinimal size={22} />
          <span className="text-xs">Subscription</span>
        </button>
        <button
          onClick={() => navigate("/dashboard/feed/you")}
          className="flex flex-col items-center text-gray-300 hover:text-white"
        >
          <CircleUser size={22} />
          <span className="text-xs">You</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
