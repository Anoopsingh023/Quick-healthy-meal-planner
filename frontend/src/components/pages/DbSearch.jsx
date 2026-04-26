import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { BackButton, RecipeCard } from "../../shared";
import { getCache, appendCache } from "../../store/recipeCache";
import { useSavedStore } from "../../store/useSavedStore";


const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-xl p-3 shadow">
    <div className="h-40 bg-gray-300 rounded-lg mb-3" />
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-300 rounded w-1/2" />
  </div>
);

const SKELETONS_INITIAL = Array.from({ length: 6 });
const SKELETONS_MORE = Array.from({ length: 3 });

// ─── DbSearch ─────────────────────────────────────────────────────────────────
const DbSearch = () => {
  const { search } = useLocation();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const query = (params.get("query") || "").trim();
  const limit = Number(params.get("limit")) || 12;

  const cacheKey = useMemo(
    () => `dbsearch-${query}-limit-${limit}`,
    [query, limit],
  );

  // ── Global saved store ─────────────────────────────────────────────────────
  const { checkSaved, toggle: toggleSave } = useSavedStore();

  // ── Local state ────────────────────────────────────────────────────────────
  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const fetchedPagesRef = useRef(new Set());
  const currentCacheKeyRef = useRef(null);

  // ── New query: load cache or reset ────────────────────────────────────────
  useEffect(() => {
    currentCacheKeyRef.current = cacheKey;
    fetchedPagesRef.current = new Set();
    isFetchingRef.current = false;

    const cached = getCache(cacheKey);
    if (cached) {
      setRecipes(cached.recipes);
      setPage(cached.page);
      setHasMore(cached.hasMore);
      for (let i = 1; i <= cached.page; i++) fetchedPagesRef.current.add(i);
    } else {
      setRecipes([]);
      setPage(1);
      setHasMore(true);
    }
  }, [cacheKey]);

  // ── Page change → fetch ───────────────────────────────────────────────────
  useEffect(() => {
    if (currentCacheKeyRef.current !== cacheKey) return;
    if (fetchedPagesRef.current.has(page)) return;
    fetchPage(page);
  }, [page, cacheKey]); 

  const fetchPage = async (pageToFetch) => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    fetchedPagesRef.current.add(pageToFetch);

    try {
      setLoading(true);
      const res = await axios.get(`${base_url}/recipes/db-search`, {
        params: { query, page: pageToFetch, limit },
        withCredentials: true,
      });

      if (currentCacheKeyRef.current !== cacheKey) return; // stale

      const newData = res.data.data || [];
      const newHasMore = newData.length === limit;

      setRecipes((prev) => {
        const map = new Map();
        [...prev, ...newData].forEach((r) => map.set(r._id, r));
        const merged = Array.from(map.values());
        appendCache(cacheKey, newData, pageToFetch, newHasMore);
        return merged;
      });

      setHasMore(newHasMore);
    } catch (err) {
      console.error("Fetch error", err);
      fetchedPagesRef.current.delete(pageToFetch);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, [hasMore]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleSave = useCallback(
    (recipeId) => toggleSave(recipeId),
    [toggleSave],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
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
          {SKELETONS_INITIAL.map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {recipes.map((r) => (
          <RecipeCard
            key={r._id}
            recipe={{ ...r, isSaved: checkSaved(r._id) }}
            onToggleSave={handleToggleSave}
          />
        ))}
      </div>

      {loading && recipes.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {SKELETONS_MORE.map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!hasMore && (
        <p className="text-center mt-4 text-gray-500">No more recipes</p>
      )}

      <div ref={observerRef} className="h-10" />
    </div>
  );
};

export default DbSearch;
