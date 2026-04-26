import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import RecipeCard from "../../shared/RecipeCard";
import BackButton from "../../shared/BackButton";
import { useSavedStore } from "../../store/useSavedStore";

const API_URL = `${base_url}/recipes`;

const parseNumber = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl p-3 shadow">
    <div className="h-40 bg-gray-300 rounded-lg mb-3" />
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
  </div>
);

const SKELETONS_INITIAL = Array.from({ length: 6 });
const SKELETONS_MORE = Array.from({ length: 3 });

const SearchResults = () => {
  const { search } = useLocation();
  const params = React.useMemo(() => new URLSearchParams(search), [search]);

  const { checkSaved, toggle: toggleSave } = useSavedStore();

  // read the params we expect (Search component builds these)
  const query = (params.get("query") || "").trim();
  const cuisine = params.get("cuisine") || ""; // comma-separated
  const dietType = params.get("dietType") || "";
  const difficulty = params.get("difficulty") || "";
  const costMin = parseNumber(params.get("costMin"));
  const costMax = parseNumber(params.get("costMax"));
  const sort = params.get("sort") || "";
  const limit = parseNumber(params.get("limit")) || 12;
  const mode = params.get("mode") || "normal";

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If there's no query and no filters, clear results and return
    const hasAnyFilter =
      query ||
      cuisine ||
      dietType ||
      difficulty ||
      costMin !== undefined ||
      costMax !== undefined ||
      sort ||
      limit;

    if (!hasAnyFilter) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchResults = async () => {
      let isStreaming = false; // 👈 ADD
      try {
        setLoading(true);
        setError(null);

        // Build params object for axios - only include defined values
        const reqParams = {};
        if (query) reqParams.query = query;
        if (cuisine) reqParams.cuisine = cuisine;
        if (dietType) reqParams.dietType = dietType;
        if (difficulty) reqParams.difficulty = difficulty;
        if (costMin !== undefined) reqParams.costMin = costMin;
        if (costMax !== undefined) reqParams.costMax = costMax;
        if (sort) reqParams.sort = sort;
        if (limit) reqParams.limit = limit;

        let res;

        if (mode === "ai") {
          isStreaming = true; // 👈 IMPORTANT
          const cacheKey = `aiRecipes-${query}`;
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);

              const ONE_DAY = 1 * 60 * 60 * 1000;

              // ✅ check expiry
              if (Date.now() - parsed.time < ONE_DAY) {
                setResults(parsed.data);

                console.log("Cached data", parsed.data);
                return; // 🚫 skip API call
              } else {
                // ❌ expired → remove
                localStorage.removeItem(cacheKey);
              }
            } catch (err) {
              console.error("Cache parse error", err);
              localStorage.removeItem(cacheKey);
            }
          }
          setLoading(true);

          const eventSource = new EventSource(
            `${API_URL}/stream-ai?query=${encodeURIComponent(query)}`,
            { withCredentials: true },
          );

          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);

              // ✅ append one by one
              setResults((prev) => {
                const updated = [...prev, data.recipe];
                const cacheKey = `aiRecipes-${query}`;

                // 🔥 store in localStorage
                const cacheData = {
                  data: updated,
                  time: Date.now(), // save current time
                };

                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                console.log("Ai response ", updated);
                return updated;
              });
            } catch (err) {
              console.error("Parse error", err);
            }
          };

          // 🔥 IMAGE UPDATE LISTENER
          eventSource.addEventListener("image", (event) => {
            const { recipeId, image } = JSON.parse(event.data);

            setResults((prev) => {
              const updated = prev.map((r) =>
                r._id === recipeId ? { ...r, image } : r,
              );

              // 🔥 UPDATE CACHE AGAIN
              const cacheKey = `aiRecipes-${query}`;
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  data: updated,
                  time: Date.now(),
                }),
              );

              return updated;
            });
          });

          eventSource.addEventListener("end", () => {
            setResults((prev) => {
              const cacheKey = `aiRecipes-${query}`;

              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  data: prev,
                  time: Date.now(),
                }),
              );

              return prev;
            });
            setLoading(false);
            eventSource.close();
          });

          eventSource.onerror = () => {
            setError("Streaming failed");
            setLoading(false);
            eventSource.close();
          };

          return () => {
            eventSource.close();
          };
        } else {
          // 🔥 NORMAL SEARCH (existing)
          res = await axios.get(`${API_URL}/search`, {
            params: reqParams,
            signal,
            withCredentials: true,
          });
        }

        const data = res?.data;
        console.log("Normal search result", res.data);

        // Try multiple common shapes and set results to an array
        if (Array.isArray(data)) {
          setResults(data);
        } else if (Array.isArray(data?.data)) {
          // e.g. { data: [ ... ] }
          setResults(data.data);
        } else if (Array.isArray(data?.data?.data)) {
          // nested { data: { data: [ ... ] } }
          setResults(data.data.data);
        } else if (Array.isArray(data?.items)) {
          setResults(data.items);
        } else if (data?.success && Array.isArray(data?.data?.docs)) {
          // mongoose-paginate style: { success: true, data: { docs: [...] } }
          setResults(data.data.docs);
        } else if (data?.success && Array.isArray(data?.data)) {
          setResults(data.data);
        } else {
          // Unexpected shape — log and fallback to empty
          console.warn("Unexpected search response shape:", data);
          setResults([]);
        }
      } catch (err) {
        // If aborted, just return silently
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }

        // Otherwise surface an error message
        console.error("Search error", err?.response?.data ?? err);
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch search results";
        setError(message);
      } finally {
        if (!isStreaming) {
          // 👈 FIX
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      // abort when component unmounts or params change
      controller.abort();
    };
  }, [
    query,
    cuisine,
    dietType,
    difficulty,
    costMin,
    costMax,
    sort,
    limit,
    search,
  ]);

  const handleToggleSave = useCallback(
    (recipeId) => toggleSave(recipeId),
    [toggleSave],
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Search results{" "}
          {query ? (
            <>
              for <span className="text-green-600">"{query}"</span>
            </>
          ) : null}
        </h2>
        <BackButton />
      </div>

      {/* <div>
        {loading && results.length == 0 ? (
          <div className="text-sm text-gray-600 animate-pulse">
            Generating recipes...
          </div>
        ) : null}
      </div> */}

      {loading && results.length === 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {SKELETONS_INITIAL.map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
      <div>
        {loading && results.length > 0 && (
          <div className="text-sm text-gray-500 animate-pulse">
            Generating more recipes...
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {results.map((r, i) => (
          <RecipeCard
            key={r._id}
            recipe={{ ...r, isSaved: checkSaved(r._id) }}
            onToggleSave={handleToggleSave}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
