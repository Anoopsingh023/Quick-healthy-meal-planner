import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { fetchSuggestions } from "../hooks/useSearchRecipe";

const Search = ({ onSelect, onSubmit }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const positionRef = useRef({ left: 0, top: 0, width: 0 }); // used to position dropdown

  // compute & set dropdown position based on input bounding rect
  const updateDropdownPosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    positionRef.current = {
      left: rect.left,
      top: rect.bottom, // place dropdown under input
      width: rect.width,
    };
    // force rerender by updating state - we'll use a tiny state toggle
    if (dropdownRef.current) {
      // apply styles directly to dropdown element if exists
      dropdownRef.current.style.left = `${positionRef.current.left}px`;
      dropdownRef.current.style.top = `${positionRef.current.top}px`;
      dropdownRef.current.style.width = `${positionRef.current.width}px`;
    }
  }, []);

  // Debounced suggestion fetching
  useEffect(() => {
    if (!query?.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    // cancel previous request
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }
    fetchAbortRef.current = new AbortController();

    const id = setTimeout(async () => {
      const data = await fetchSuggestions(query, fetchAbortRef.current.signal);
      setSuggestions(Array.isArray(data) ? data : []);
      setLoading(false);
      // If input is focused, show suggestions
      if (document.activeElement === inputRef.current) {
        setShowSuggestions((prev) =>
          Array.isArray(data) && data.length > 0 ? true : prev
        );
      }
      // position in case layout changed
      updateDropdownPosition();
    }, 500);

    return () => {
      clearTimeout(id);
      if (fetchAbortRef.current) {
        try {
          fetchAbortRef.current.abort();
        } catch (_) {}
      }
    };
  }, [query, updateDropdownPosition]);

  // reposition dropdown on scroll/resize and when suggestions open
  useEffect(() => {
    const onScrollOrResize = () => {
      updateDropdownPosition();
    };
    window.addEventListener("scroll", onScrollOrResize, true); // true => capture so it runs earlier
    window.addEventListener("resize", onScrollOrResize);
    // Also update when suggestions shown
    if (showSuggestions) updateDropdownPosition();

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [showSuggestions, updateDropdownPosition]);

  // hide suggestions when clicking outside (input or dropdown)
  useEffect(() => {
    const onDocMouseDown = (e) => {
      const target = e.target;
      if (
        inputRef.current &&
        (inputRef.current === target || inputRef.current.contains(target))
      ) {
        // click inside input -> keep
        return;
      }
      if (
        dropdownRef.current &&
        (dropdownRef.current === target || dropdownRef.current.contains(target))
      ) {
        // click inside dropdown -> keep
        return;
      }
      // else hide
      setShowSuggestions(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // show suggestions on focus if we have them
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
      // reposition to ensure correct coords
      updateDropdownPosition();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (query || "").trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    navigate(`/dashboard/search?q=${encodeURIComponent(trimmed)}`);
    if (onSubmit) onSubmit(trimmed);
  };

  const handleSelect = (item) => {
    setQuery(item.title || item.name || "");
    setShowSuggestions(false);
    if (onSelect) onSelect(item);
  };

  // Render dropdown via portal into body so it's not clipped and sits above everything
  const dropdown =
    showSuggestions && suggestions.length > 0
      ? createPortal(
          <ul
            ref={dropdownRef}
            className="bg-white border border-gray-200 rounded-2xl shadow-lg max-h-72 overflow-auto z-[10000]"
            style={{
              position: "fixed",
              left: positionRef.current.left,
              top: positionRef.current.top,
              width: positionRef.current.width,
              // small transform to visually separate from input
              marginTop: 6,
            }}
          >
            {suggestions.map((item) => (
              <li
                key={item._id || item.id || item.title + Math.random()}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {item.title || item.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.metadata?.cuisine
                        ? `${item.metadata.cuisine} • `
                        : ""}
                      {item.metadata?.dietType || ""}
                    </span>
                  </div>
                  {/* optional small meta */}
                  {item.metadata?.cookingTime && (
                    <div className="text-xs text-gray-400">
                      {item.metadata.cookingTime}m
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <form onSubmit={handleSubmit} className="mt-6 w-full max-w-xl  relative">
      <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 focus-within:ring-2 focus-within:ring-green-400 transition-all duration-200">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search recipes, ingredients, or cuisines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            className="w-full px-5 py-3 text-gray-700 rounded-full focus:outline-none"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
          />
        </div>

        <button
          type="submit"
          className="ml-2 mr-1 px-5 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Search
        </button>
      </div>
      {dropdown}
    </form>
  );
};

export default Search;
