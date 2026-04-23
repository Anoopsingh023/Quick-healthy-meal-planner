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

  const cacheKey = useMemo(() => `dbsearch-${query}-limit-${limit}`, [query, limit]);

  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
  // Tracks which pages have already been fetched for current cacheKey
  const fetchedPagesRef = useRef(new Set());
  const currentCacheKeyRef = useRef(null);

  // ✅ SINGLE EFFECT: handles cacheKey change (new query)
  useEffect(() => {
    currentCacheKeyRef.current = cacheKey;
    fetchedPagesRef.current = new Set();
    isFetchingRef.current = false;

    const memoryCache = searchCache[cacheKey];
    const raw = sessionStorage.getItem(cacheKey);
    const sessionCache = raw ? JSON.parse(raw) : null;
    // const cached = memoryCache || sessionCache;
    const cached = null

    if (cached) {
      console.log("⚡ Cache hit for", cacheKey);
      setRecipes(cached.recipes);
      setPage(cached.page);
      setHasMore(cached.hasMore);
      console.log("Cached data",cached)
      // Mark all pages up to cached.page as already fetched
      for (let i = 1; i <= cached.page; i++) {
        fetchedPagesRef.current.add(i);
      }
    } else {
      console.log("🆕 No cache, resetting for", cacheKey);
      setRecipes([]);
      setPage(1);
      setHasMore(true);
      // page=1 will be fetched by the page effect below
    }
  }, [cacheKey]);

  // ✅ SINGLE EFFECT: fires on page change, skips if already fetched
  useEffect(() => {
    // Guard: cacheKey must be initialized
    if (currentCacheKeyRef.current !== cacheKey) return;
    // Guard: skip if this page was already loaded from cache
    if (fetchedPagesRef.current.has(page)) {
      console.log("⛔ Skipping page (already fetched):", page);
      return;
    }

    fetchData(page);
  }, [page, cacheKey]);


  const fetchData = async (pageToFetch) => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    fetchedPagesRef.current.add(pageToFetch); // mark immediately to prevent double fetch

    try {
      setLoading(true);
      console.log("🚀 API CALL page:", pageToFetch);

      const res = await axios.get(`${base_url}/recipes/db-search`, {
        params: { query, page: pageToFetch, limit },
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      // Bail if cacheKey changed while fetching
      if (currentCacheKeyRef.current !== cacheKey) {
        console.log("🚫 Stale response, ignoring");
        return;
      }

      const newData = res.data.data || [];
      console.log("Dbsearch api call",res.data)

      setRecipes((prev) => {
        const map = new Map();
        [...prev, ...newData].forEach((r) => map.set(r._id, r));
        const updated = Array.from(map.values());

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
      fetchedPagesRef.current.delete(pageToFetch); // allow retry on error
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // INFINITE SCROLL OBSERVER
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
        { headers: { Authorization: "Bearer " + localStorage.getItem("token") } },
      );
    } catch {
      setRecipes((prev) =>
        prev.map((r) => (r._id === recipeId ? { ...r, isSaved: !r.isSaved } : r)),
      );
    }
  };

  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-xl p-3 shadow">
      <div className="h-40 bg-gray-300 rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Search results{" "}
          {query && <span className="text-green-600">"{query}"</span>}
        </h2>
        <BackButton />
      </div>

      {loading && recipes.length === 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {recipes.map((r) => (
          <RecipeCard key={r._id} recipe={r} onToggleSave={handleToggleSave} />
        ))}
      </div>

      {loading && recipes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!hasMore && <p className="text-center mt-4 text-gray-500">No more recipes</p>}

      <div ref={observerRef} className="h-10"></div>
    </div>
  );
};

export default DbSearch;