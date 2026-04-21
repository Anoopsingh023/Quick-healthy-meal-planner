import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { BackButton, RecipeCard } from "../../shared";

// 🔥 GLOBAL MEMORY CACHE
const searchCache = {};

const DbSearch = () => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const query = (params.get("query") || "").trim();
  const limit = Number(params.get("limit")) || 12;

  // 🔑 CACHE KEY
  const cacheKey = useMemo(() => {
    return `dbsearch-${query}-limit-${limit}`;
  }, [query, limit]);

  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const hasMountedRef = useRef(false);
const isCacheHydratedRef = useRef(false);


  // LOAD FROM CACHE
  useEffect(() => {
    const memoryCache = searchCache[cacheKey];
    const sessionCache = sessionStorage.getItem(cacheKey);

    if (memoryCache || sessionCache) {
      const cached = memoryCache || JSON.parse(sessionCache);

      setRecipes(cached.recipes);
      setPage(cached.page);
      setHasMore(cached.hasMore);

      isCacheHydratedRef.current = true;

      console.log("⚡ Cache hit",searchCache[cacheKey]);
    } else {
      setRecipes([]);
      setPage(1);
      setHasMore(true);
      isCacheHydratedRef.current = false;
    }
    hasMountedRef.current = false;
  }, [cacheKey]);


  useEffect(() => {
  if (!hasMountedRef.current) {
    hasMountedRef.current = true;

    if (isCacheHydratedRef.current) {
      console.log("⛔ Skipping API (cache used)");
      return;
    }
  }

  fetchData(page);
}, [page]);


  // FETCH FUNCTION
  const fetchData = async (pageToFetch = page, ) => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;

    try {
      setLoading(true);
      console.log("🚀 API CALL page:", pageToFetch);
      const startTime = performance.now();

      const res = await axios.get(`${base_url}/recipes/db-search`, {
        params: { query, page: pageToFetch, limit },
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      const endTime = performance.now();

      console.log(`🚀 API Time: ${(endTime - startTime).toFixed(2)} ms`);

      const newData = res.data.data || [];
      console.log("DbSearch api called", res.data);

      setRecipes((prev) => {

        const map = new Map();
        [...prev, ...newData].forEach((r) => map.set(r._id, r));

        const updated = Array.from(map.values());

        // 🔥 SAVE CACHE
        const cacheData = {
          recipes: updated,
          page: pageToFetch,
          hasMore: newData.length === limit,
        };

        searchCache[cacheKey] = cacheData;
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));

        return updated;
      });

      setHasMore(newData.length === limit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };


  // OBSERVER (INFINITE SCROLL)
  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          console.log("📄 Next page");
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);

    return () => observer.unobserve(node);
  }, [hasMore]);

  
  // SAVE / UNSAVE
  const handleToggleSave = async (recipeId) => {
    setRecipes((prev) =>
      prev.map((r) => (r._id === recipeId ? { ...r, isSaved: !r.isSaved } : r)),
    );

    try {
      await axios.post(
        `${base_url}/users/me/toggle-save/${recipeId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
    } catch (err) {
      // revert
      setRecipes((prev) =>
        prev.map((r) =>
          r._id === recipeId ? { ...r, isSaved: !r.isSaved } : r,
        ),
      );
    }
  };

  useEffect(() => {
    setRecipes([]);
    setPage(1);
    setHasMore(true);
    isFetchingRef.current = false;
  }, [query]);

  
  // SKELETON
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-xl p-3 shadow">
      <div className="h-40 bg-gray-300 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );

  
  // UI
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Search results{" "}
          {query && <span className="text-green-600">"{query}"</span>}
        </h2>
        <BackButton />
      </div>

      {/* Initial loading */}
      {loading && recipes.length === 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {recipes.map((r) => (
          <RecipeCard key={r._id} recipe={r} onToggleSave={handleToggleSave} />
        ))}
      </div>

      {/* Load more skeleton */}
      {loading && recipes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!hasMore && (
        <p className="text-center mt-4 text-gray-500">No more recipes</p>
      )}

      {/* Sentinel */}
      <div ref={observerRef} className="h-10"></div>
    </div>
  );
};

export default DbSearch;
