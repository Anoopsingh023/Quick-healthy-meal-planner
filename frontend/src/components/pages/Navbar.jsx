import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Navbar = ({ onSearch, onToggleSidebar, isSidebarCollapsed }) => {
  const navigate = useNavigate();
  const [logedin, setLogedin] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSearchInput, setOpenSearchInput] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (localStorage.getItem("token")) setLogedin(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menu) => {
    setOpen(false);
    if (menu === "Your Profile") {
       navigate("/dashboard/user-profile")
      // window.open(`/channel/${localStorage.getItem("userName")}`, "_blank");
    } else if (menu === "Logout") {
      // perform logout flow or call API
      ["token", "userId", "userName", "avatar", "coverImage", "name"].forEach(
        (item) => localStorage.removeItem(item)
      );
      setLogedin(false);
      window.location.href = "/dashboard";
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    if (onSearch) onSearch(query);
  };

  const handleFeedbackClick = () => {
    navigate(`/dashboard/feedback`);
  };

  return (
    <nav className="flex items-center justify-between px-5 py-3 bg-[#b7b7b7]">
      {openSearchInput ? (
        // Full-width search view
        <div className="flex items-center w-full gap-2">
          <ArrowLeft onClick={() => setOpenSearchInput(false)} size={22} className="cursor-pointer" />
          <input
            autoFocus
            className=" w-full px-5 py-2 my-5 border rounded-2xl"
            type="text"
            placeholder="Search"
            onChange={handleSearchInput}
          />
        </div>
      ) : (
        <>
          {/* Left Side */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle */}
            <span className="hidden sm:block">
              <i
                onClick={onToggleSidebar}
                className="fa-solid fa-bars hover:bg-[#3b3b3b] p-3 cursor-pointer rounded-full"
              />
            </span>

            {/* Show app name in navbar ONLY when sidebar is collapsed */}
            {isSidebarCollapsed && (
              <h2 className="font-bold ml-10 text-3xl text-[#0b7b2a]">Cookly</h2>
            )}
          </div>

          <marquee behavior="" direction="" className="text-2xl w-3xl">Type what you have. Cook what you can</marquee>

          {/* Right Side */}
          {logedin ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleFeedbackClick}
                className="border border-[#6f6d6d] bg-[#232323] py-2 px-3 rounded-full cursor-pointer text-blue-400 hover:bg-[#4c9ed566]"
              >
                Feedback
              </button>

              <div ref={dropdownRef} className="relative">
                <img
                  onClick={() => setOpen((o) => !o)}
                  className="h-12 w-12 rounded-full cursor-pointer"
                  src={localStorage.getItem("avatar")}
                  alt="avatar"
                />
                {open && (
                  <div className="bg-[#042e52] text-white absolute w-56 z-50 -left-45 top-14 p-4 rounded-xl shadow-xl">
                    
                    <ul>
                      {["Your Profile", "Theme", "Help", "Logout"].map((menu, index) => (
                        <li
                          key={index}
                          onClick={() => handleMenuClick(menu)}
                          className="py-2 px-4 hover:bg-[#08527d] rounded-xl cursor-pointer"
                        >
                          {menu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Mobile search icon */}
              <span className="sm:hidden">
                <i onClick={() => setOpenSearchInput(true)} className="fa fa-search text-xl cursor-pointer" />
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleFeedbackClick}
                className="border border-[#6f6d6d] bg-[#232323] py-2 px-3 rounded-full cursor-pointer text-blue-400 hover:bg-[#4c9ed566]"
              >
                Feedback
              </button>

              <Link to="/login" className="border bg-[#232323] py-2 px-4 rounded-full cursor-pointer text-blue-400 hover:bg-[#4c9ed566]">
                <i className="fa-regular fa-user" /> Sign in
              </Link>

              <span className="sm:hidden">
                <i onClick={() => setOpenSearchInput(true)} className="fa fa-search text-xl cursor-pointer" />
              </span>
            </div>
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;
