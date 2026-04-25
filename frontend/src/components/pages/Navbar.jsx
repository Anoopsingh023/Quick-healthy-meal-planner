import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({ onSearch, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [openSearchInput, setOpenSearchInput] = useState(false);

  const dropdownRef = useRef();

  // ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------- MENU HANDLER ----------------
  const handleMenuClick = async (menu) => {
    setOpen(false);

    switch (menu) {
      case "Profile":
        navigate("/dashboard/user-profile");
        break;

      case "Logout":
        await logout();
        navigate("/login");
        break;

      default:
        break;
    }
  };

  // ---------------- SEARCH ----------------
  const handleSearchInput = (e) => {
    const query = e.target.value;
    if (onSearch) onSearch(query);
  };

  return (
    <nav className="flex items-center justify-between px-5 py-3 bg-[#b7b7b7]">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:block">
          <i
            onClick={onToggleSidebar}
            className="fa-solid fa-bars hover:bg-gray-200 p-3 cursor-pointer rounded-full"
          />
        </span>
        <h2
          className="font-bold text-3xl ml-15 text-[#0b7b2a] cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Cooklio
        </h2>
      </div>

      {/* CENTER */}
      <marquee className="text-lg w-3xl text-gray-600 hidden md:block">
        Type what you have. Cook what you can 🍳
      </marquee>

      {/* RIGHT SIDE */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {/* Feedback */}
          <button
            onClick={() => navigate("/dashboard/feedback")}
            className="border border-[#6f6d6d] py-2 px-3 rounded-full cursor-pointer  hover:bg-[#61616166]"
          >
            Feedback
          </button>

          {/* USER AVATAR */}
          <div ref={dropdownRef} className="relative">
            <img
              onClick={() => setOpen((o) => !o)}
              className="h-10 w-10 rounded-full cursor-pointer object-cover"
              src={user?.avatar}
              alt="avatar"
            />

            {open && (
              <div className="bg-[#042e52] text-white absolute w-56 z-50 -left-45 top-14 p-4 rounded-xl shadow-xl">
                <div className="px-3 py-2 border-b text-sm ">
                  {user?.fullName}
                </div>

                <ul>
                  {["Profile", "Logout"].map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleMenuClick(item)}
                      className="px-3 py-2 hover:bg-[#08527d] rounded-lg cursor-pointer text-sm"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* MOBILE SEARCH */}
          <span className="sm:hidden">
            <i
              onClick={() => setOpenSearchInput(true)}
              className="fa fa-search text-xl cursor-pointer"
            />
          </span>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard/feedback")}
            className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100"
          >
            Feedback
          </button>

          <Link
            to="/login"
            className="px-4 py-1 rounded-full bg-[#042d52] text-white text-sm hover:opacity-90"
          >
            Sign in
          </Link>

          <span className="sm:hidden">
            <i
              onClick={() => setOpenSearchInput(true)}
              className="fa fa-search text-xl cursor-pointer"
            />
          </span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
