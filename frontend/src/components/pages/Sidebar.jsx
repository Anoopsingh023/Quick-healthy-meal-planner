import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

const Sidebar = ({ isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "You";

  const navLinks = [
    { to: "/dashboard", icon: "fa-house", label: "Home" },
    { to: "/dashboard/saved-recipe", icon: "fa-bolt", label: "Recipe" },
    { to: "/dashboard/shopping-bag", icon: "fa-tv", label: "Shopping List" },
    { to: "/dashboard/about", icon: "fa-circle-info", label: "About" },
  ];

  const renderLinks = (links) =>
    links.map(({ to, icon, label }) => (
      <Link
        key={label}
        to={to}
        className={`${
          location.pathname === to ? "bg-[#08527d]" : "hover:bg-[#08527d]"
        } flex items-center gap-3 py-3 px-4 rounded-xl transition-colors duration-300`}
      >
        <i
          className={`fa-solid ${icon} ${isCollapsed ? "mx-auto text-xl" : ""}`}
        />
        {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
      </Link>
    ));

  return (
    <div
      className={`flex flex-col h-full text-[#e3dede] transition-all duration-300`}
    >
      {/* Top area: logo and name */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-[#08324a]`}
      >
        {/* Logo always visible */}
        <Link to="/dashboard" className="flex items-center">
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
            <p className="text-sm text-[#bfcbd6]">Hi, {localStorage.getItem("name") || username}</p>
          </div>
        )}
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
              onClick={() => navigate("/dashboard/user-profile")}
              src={localStorage.getItem("avatar") || logo}
              alt="avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
            <div>
              <div
                onClick={() => navigate("/dashboard/user-profile")}
                className="text-sm font-medium cursor-pointer"
              >
                {localStorage.getItem("name") || username}
              </div>
              <div
                onClick={() => navigate("/dashboard/user-profile")}
                className="text-xs text-[#bfcbd6] cursor-pointer"
              >
                View profile
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {/* only a small avatar when collapsed */}
            <img
            onClick={() => navigate("/dashboard/user-profile")}
              src={localStorage.getItem("avatar") || logo}
              alt="avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
