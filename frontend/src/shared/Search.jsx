import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSuggestions } from "../hooks/useSearchRecipe";


const Search = ({ onSelect, onSubmit }) => {
  const navigate = useNavigate();
  const { search: locationSearch } = useLocation();
  const paramsFromUrl = useMemo(
    () => new URLSearchParams(locationSearch),
    [locationSearch]
  );

  // main input + suggestions
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // filters UI state (these are the 'saved' filter values when user clicks Apply)
  const [filterOpen, setFilterOpen] = useState(false);
  const [cuisines, setCuisines] = useState([]); // array of cuisine chips
  const [cuisineInput, setCuisineInput] = useState("");
  const [dietType, setDietType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [sort, setSort] = useState("latest");
  const [limit, setLimit] = useState(12);

  // refs & positioning
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const fetchAbortRef = useRef(null);
  const positionRef = useRef({ left: 0, top: 0, width: 0 });
  const filterPanelRef = useRef(null);

  // PREFILL FROM URL ON MOUNT / WHEN location.search CHANGES
  useEffect(() => {
    const params = paramsFromUrl;
    // primary search param key used by SearchResults is 'query'
    const q = (params.get("query") || "").trim();
    setQuery(q);

    const cuisineParam = params.get("cuisine") || ""; // comma separated
    const parsedCuisines =
      cuisineParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    setCuisines(parsedCuisines);

    setDietType(params.get("dietType") || "");
    setDifficulty(params.get("difficulty") || "");
    setCostMin(params.get("costMin") || "");
    setCostMax(params.get("costMax") || "");
    setSort(params.get("sort") || "latest");
    setLimit(() => {
      const v = Number(params.get("limit"));
      return Number.isFinite(v) && v > 0 ? v : 12;
    });

    const saved = localStorage.getItem("savedSearchFilters");
    if (saved) {
      const f = JSON.parse(saved);
      setCuisines(f.cuisines || []);
      setDietType(f.dietType || "");
      setDifficulty(f.difficulty || "");
      setCostMin(f.costMin || "");
      setCostMax(f.costMax || "");
      setSort(f.sort || "latest");
      setLimit(f.limit || 12);
    }

    // close suggestions when navigating to results
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  }, [paramsFromUrl]);

  // compute count of active filters for the badge (excluding query text)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += cuisines.length;
    if (dietType) count += 1;
    if (difficulty) count += 1;
    if (costMin !== "" && costMin !== null && costMin !== undefined) count += 1;
    if (costMax !== "" && costMax !== null && costMax !== undefined) count += 1;
    if (sort && sort !== "latest") count += 1;
    if (limit && Number(limit) !== 12) count += 1;
    return count;
  }, [cuisines, dietType, difficulty, costMin, costMax, sort, limit]);

  // positioning
  const updateDropdownPosition = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    positionRef.current = {
      left: rect.left,
      top: rect.bottom,
      width: rect.width,
    };
    if (dropdownRef.current) {
      dropdownRef.current.style.left = `${positionRef.current.left}px`;
      dropdownRef.current.style.top = `${positionRef.current.top}px`;
      dropdownRef.current.style.width = `${positionRef.current.width}px`;
    }
  }, []);

  // suggestions fetching (debounced) — honors AbortController signal
  useEffect(() => {
    if (!query?.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    setLoading(true);
    if (fetchAbortRef.current) {
      try {
        fetchAbortRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    const id = setTimeout(async () => {
      try {
        const data = await fetchSuggestions(query, controller.signal);
        const items = Array.isArray(data) ? data : [];
        setSuggestions(items);
        setShowSuggestions(items.length > 0);
        setHighlightedIndex(items.length > 0 ? 0 : -1);
      } catch (err) {
        // fetchSuggestions already catches aborts; ensure we reset on error
        setSuggestions([]);
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      } finally {
        setLoading(false);
        updateDropdownPosition();
      }
    }, 350);

    return () => {
      clearTimeout(id);
      try {
        controller.abort();
      } catch {}
    };
  }, [query, updateDropdownPosition]);

  // reposition dropdown on scroll/resize
  useEffect(() => {
    const fn = () => updateDropdownPosition();
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    if (showSuggestions) updateDropdownPosition();
    return () => {
      window.removeEventListener("scroll", fn, true);
      window.removeEventListener("resize", fn);
    };
  }, [showSuggestions, updateDropdownPosition]);

  // hide suggestions when clicking outside
  useEffect(() => {
    const onDocMouseDown = (e) => {
      const t = e.target;
      if (
        inputRef.current &&
        (inputRef.current === t || inputRef.current.contains(t))
      )
        return;
      if (
        dropdownRef.current &&
        (dropdownRef.current === t || dropdownRef.current.contains(t))
      )
        return;
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // close filter panel when clicking outside it
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (
        filterPanelRef.current &&
        (filterPanelRef.current === e.target ||
          filterPanelRef.current.contains(e.target))
      )
        return;
      setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  // keyboard navigation for suggestions
  const scrollHighlightedIntoView = (index) => {
    if (!dropdownRef.current) return;
    const items = dropdownRef.current.querySelectorAll("[data-suggest-index]");
    if (!items || items.length === 0) return;
    const idx = Math.max(0, Math.min(items.length - 1, index));
    const el = items[idx];
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  };

  const onInputKeyDown = (e) => {
    if (!showSuggestions) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        setShowSuggestions(true);
        setHighlightedIndex(0);
        updateDropdownPosition();
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = Math.min(suggestions.length - 1, prev + 1);
        scrollHighlightedIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = Math.max(0, prev - 1);
        scrollHighlightedIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  // select suggestion
  const handleSelect = (item) => {
    setQuery(item.title || item.name || "");
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (onSelect) onSelect(item);
  };

  // Build query string from current state
  const buildQueryParams = (overrides = {}) => {
    const params = new URLSearchParams();
    const q = overrides.query !== undefined ? overrides.query : query;
    if (q && q.trim()) params.append("query", q.trim());
    const cs = overrides.cuisines !== undefined ? overrides.cuisines : cuisines;
    if (cs && cs.length > 0) params.append("cuisine", cs.join(","));
    const d = overrides.dietType !== undefined ? overrides.dietType : dietType;
    if (d && d.trim()) params.append("dietType", d.trim());
    const diff =
      overrides.difficulty !== undefined ? overrides.difficulty : difficulty;
    if (diff && diff.trim()) params.append("difficulty", diff.trim());
    const min = overrides.costMin !== undefined ? overrides.costMin : costMin;
    const max = overrides.costMax !== undefined ? overrides.costMax : costMax;
    if (min !== "" && min !== null && min !== undefined)
      params.append("costMin", String(min));
    if (max !== "" && max !== null && max !== undefined)
      params.append("costMax", String(max));
    const s = overrides.sort !== undefined ? overrides.sort : sort;
    if (s) params.append("sort", s);
    const lim = overrides.limit !== undefined ? overrides.limit : limit;
    if (lim) params.append("limit", String(lim));
    return params.toString();
  };

  const applyFilters = () => {
    setFilterOpen(false);

    const filterState = {
      cuisines,
      dietType,
      difficulty,
      costMin,
      costMax,
      sort,
      limit,
    };
    localStorage.setItem("savedSearchFilters", JSON.stringify(filterState));
  };

  // RESET filters in UI
  const resetFilters = () => {
    setCuisines([]);
    setCuisineInput("");
    setDietType("");
    setDifficulty("");
    setCostMin("");
    setCostMax("");
    setSort("latest");
    setLimit(12);
  };

  // submit: navigate with all filters (called when user clicks Search)
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    // allow empty query if filters exist
    const trimmed = (query || "").trim();
    const hasFilter =
      cuisines.length > 0 ||
      dietType ||
      difficulty ||
      costMin !== "" ||
      costMax !== "" ||
      (sort && sort !== "latest") ||
      (limit && Number(limit) !== 12);

    if (!trimmed && !hasFilter) {
      // nothing to search — ignore
      return;
    }

    const qs = buildQueryParams({ query: trimmed });
    navigate(`/dashboard/search?${qs}`);

    if (onSubmit) {
      onSubmit({
        query: trimmed,
        cuisines,
        dietType,
        difficulty,
        costMin,
        costMax,
        sort,
        limit,
      });
    }

    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  // cuisine chips helpers
  const addCuisine = (value) => {
    const v = String(value || "").trim();
    if (!v) return;
    const lower = v.toLowerCase();
    if (cuisines.some((c) => c.toLowerCase() === lower)) {
      setCuisineInput("");
      return;
    }
    setCuisines((prev) => [...prev, v]);
    setCuisineInput("");
  };

  const removeCuisine = (idx) =>
    setCuisines((prev) => prev.filter((_, i) => i !== idx));

  const onCuisineKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCuisine(cuisineInput);
    } else if (
      e.key === "Backspace" &&
      cuisineInput === "" &&
      cuisines.length > 0
    ) {
      removeCuisine(cuisines.length - 1);
    }
  };

  // keep dropdown positioned after layout changes
  useLayoutEffect(() => {
    if (showSuggestions) updateDropdownPosition();
  }, [showSuggestions, updateDropdownPosition, suggestions.length]);

  // dropdown portal render
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
              marginTop: 6,
            }}
            role="listbox"
            aria-label="Recipe suggestions"
          >
            {suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <li
                  id={`suggestion-${idx}`}
                  key={
                    item._id || item.id || `${item.title || item.name}-${idx}`
                  }
                  data-suggest-index={idx}
                  onMouseDown={(ev) => {
                    ev.preventDefault(); // select before blur
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                    isHighlighted
                      ? "bg-green-50 text-green-700"
                      : "hover:bg-gray-50"
                  }`}
                  role="option"
                  aria-selected={isHighlighted}
                >
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
                  {item.metadata?.cookingTime && (
                    <div className="text-xs text-gray-400">
                      {item.metadata.cookingTime}m
                    </div>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body
        )
      : null;

  return (
    <div className="relative w-full max-w-xl mt-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center bg-white rounded-full shadow-md border border-gray-200 focus-within:ring-2 focus-within:ring-green-400 transition-all duration-200 flex-1">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search recipes, ingredients, or cuisines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                  setHighlightedIndex(0);
                  updateDropdownPosition();
                }
              }}
              onKeyDown={onInputKeyDown}
              className="w-full px-5 py-3 text-gray-700 rounded-full focus:outline-none"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `suggestion-${highlightedIndex}`
                  : undefined
              }
            />
          </div>

          <button
            type="submit"
            className="ml-2 mr-1 px-5 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Search"
          >
            Search
          </button>
        </div>

        {/* Filter button with active filter badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((s) => !s)}
            className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
              filterOpen
                ? "bg-green-50 border-green-300"
                : "bg-white border-gray-200"
            } text-sm`}
            aria-expanded={filterOpen}
            aria-controls="search-filter-panel"
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center text-xs font-medium px-2 py-1 bg-green-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Filter panel */}
          {filterOpen && (
            <div
              ref={filterPanelRef}
              id="search-filter-panel"
              className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-[10001]"
            >
              <div className="space-y-3">
                {/* Cuisines multi-select chips */}
                <div>
                  <label className="text-xs text-gray-500">Cuisines</label>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {cuisines.map((c, idx) => (
                      <div
                        key={`${c}-${idx}`}
                        className="flex items-center gap-2 bg-gray-100 text-sm px-2 py-1 rounded-full"
                      >
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => removeCuisine(idx)}
                          className="text-xs px-1 rounded-full hover:bg-gray-200"
                          aria-label={`Remove ${c}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <input
                      value={cuisineInput}
                      onChange={(e) => setCuisineInput(e.target.value)}
                      onKeyDown={onCuisineKeyDown}
                      placeholder="Type cuisine and press Enter"
                      className="min-w-[120px] px-3 py-2 rounded-lg border border-gray-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addCuisine(cuisineInput)}
                      className="px-3 py-1 rounded-full border border-gray-200 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Add multiple cuisines (e.g. Indian, Italian). They will be
                    sent as comma-separated values.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">Diet</label>
                    <select
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200"
                    >
                      <option value="">Any</option>
                      <option value="Veg">Veg</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Keto">Keto</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200"
                    >
                      <option value="">Any</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500">
                      Cost Min (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={costMin}
                      onChange={(e) => setCostMin(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Cost Max (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={costMax}
                      onChange={(e) => setCostMax(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500">Sort</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200"
                  >
                    <option value="latest">Latest</option>
                    <option value="costAsc">Cost — Low to High</option>
                    <option value="costDesc">Cost — High to Low</option>
                    <option value="timeAsc">Time — Short to Long</option>
                    <option value="timeDesc">Time — Long to Short</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Per page</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-16 mt-1 px-2 py-1 rounded-lg border border-gray-200"
                    />
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-3 py-1 text-sm rounded-full border border-gray-200"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="px-3 py-1 text-sm rounded-full bg-green-600 text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* suggestions portal */}
      {dropdown}
    </div>
  );
};

export default Search;