import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const navLinks = [
    { to: "/dashboard", icon: "fa-house", label: "Home" },
    { to: "/dashboard/saved-recipe", icon: "fa-bowl-food", label: "Recipe" },
    {
      to: "/dashboard/shopping-bag",
      icon: "fa-cart-shopping",
      label: "Shopping List",
    },
    {
      to: "/dashboard/user-recipe",
      icon: "fa-bread-slice",
      label: "Your Recipe",
    },
    {
      to: "/dashboard/cook-insta",
      icon: "fa-brands fa-odnoklassniki",
      label: "Cook insta",
    },
  ];

  const renderLinks = (links) =>
    links.map(({ to, icon, label }) => (
      <Link
        key={label}
        to={to}
        className={`${
          location.pathname === to ? "bg-[#08527d]" : "hover:bg-[#08527d]"
        } flex flex-col items-center gap-2 py-3  rounded-xl transition-colors duration-300`}
      >
        <i
          className={`fa-solid ${icon}`}
        />
        <span className="text-xs">{label}</span>
      </Link>
    ));

  return (
    <div
      className={`flex flex-col h-full text-[#e3dede] transition-all duration-300`}
    >
      <div
        className={`flex items-center gap-3 px-5 py-4 border-b border-[#08324a]`}
      >
        <Link to="/dashboard" className="flex items-center">
          <img
            src={logo}
            alt="logo"
            className={`rounded-xl object-cover h-12 w-15 `}
          />
        </Link>
      </div>

      <div className={`px-1 pt-4 flex-1 overflow-auto space-y-1`}>
        {renderLinks(navLinks)}
      </div>

      {isAuthenticated ? (
        <div className="px-4 py-4 border-t border-[#08324a]">
          <div className="flex justify-center">
            <img
              onClick={() => navigate("/dashboard/user-profile")}
              src={user?.avatar}
              alt="avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Sidebar;
