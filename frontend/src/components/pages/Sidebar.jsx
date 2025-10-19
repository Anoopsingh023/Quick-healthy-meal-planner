import React from "react";
import { useLocation, Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";

const Sidebar = ({ isCollapsed,onToggleSidebar }) => {
  const location = useLocation();
  const username = localStorage.getItem("username") || "You";

  const navLinks = [
    { to: "/dashboard/home", icon: "fa-house", label: "Home" },
    { to: "/dashboard/short-page", icon: "fa-bolt", label: "Recipe" },
    { to: "/dashboard/subscription", icon: "fa-tv", label: "Shopping List" },
    { to: "/dashboard/about", icon: "fa-circle-info", label: "About" },
  ];

  const renderLinks = (links) =>
    links.map(({ to, icon, label }) => (
      <Link
        key={label}
        to={to}
        className={`${
          location.pathname === to ? "bg-[#3b3b3b]" : "hover:bg-[#3b3b3b]"
        } flex items-center gap-3 py-3 px-4 rounded-xl transition-colors`}
      >
        <i className={`fa-solid ${icon} ${isCollapsed ? "mx-auto text-xl" : ""}`} />
        {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
      </Link>
    ));

  return (
    <div
    onClick={onToggleSidebar}
      className={`flex flex-col h-full text-[#e3dede] transition-all duration-300`}
    >
      {/* Top area: logo and name */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-[#08324a]`}
      >
        {/* Logo always visible */}
        <Link to="/dashboard/home" className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className={`rounded-xl object-cover ${
              isCollapsed ? "w-10 h-10 mx-auto" : "w-12 h-12"
            }`}
          />
        </Link>

        {/* Show name only when expanded */}
        {!isCollapsed && (
          <div className="ml-2">
            <h3 className=" font-bold text-3xl text-[#0b7b2a]">Cookly</h3>
            <p className="text-sm text-[#bfcbd6]">Hi, {username}</p>
          </div>
        )}
        {!isCollapsed ? <span className="hidden sm:block ml-7">
              {/* <i
                onClick={onToggleSidebar}
                className="fa-solid fa-bars hover:bg-[#3b3b3b] p-3 cursor-pointer rounded-full"
              /> */}
              <button onClick={onToggleSidebar}>X</button>
            </span>:null}
      </div>

      {/* Nav Links */}
      <div className={`px-2 pt-4 flex-1 overflow-auto space-y-1`}>
        {renderLinks(navLinks)}
      </div>

      {/* Footer (small profile / version) */}
      <div className="px-4 py-4 border-t border-[#08324a]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <img
              src={localStorage.getItem("avatar") || logo}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="text-sm font-medium">{localStorage.getItem("name") || username}</div>
              <div className="text-xs text-[#bfcbd6]">View profile</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* only a small avatar when collapsed */}
            <img
              src={localStorage.getItem("avatar") || logo}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
