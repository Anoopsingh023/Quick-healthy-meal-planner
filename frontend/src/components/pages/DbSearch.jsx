import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { BackButton, RecipeCard } from "../../shared";
import { useRef } from "react";

const DbSearch = () => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const query = (params.get("query") || "").trim();
  const limit = Number(params.get("limit")) || 12;

  const [recipes, setRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    fetchData();
  }, [page, query, limit]);

  const fetchData = async () => {
    if (isFetchingRef.current) return; 

    isFetchingRef.current = true;
    try {
      setLoading(true);

      const res = await axios.get(`${base_url}/recipes/db-search`, {
        params: { query, page, limit },
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log("DBSearch result", res.data);

      const newData = res.data.data || [];

      setRecipes((prev) => {
        const map = new Map();
        [...prev, ...newData].forEach((r) => map.set(r._id, r));
        return Array.from(map.values());
      });

      setHasMore(newData.length === limit); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };


  // 🔥 Reset
  useEffect(() => {
    setPage(1);
    setRecipes([]);
    setHasMore(true);
    isFetchingRef.current = false;
  }, [query]);

  // 🔥 IntersectionObserver
  // useEffect(() => {
  //   if (loading) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && hasMore && !fetching) {
  //         setFetching(true);
  //         setPage((prev) => prev + 1);
  //       }
  //     },
  //     { rootMargin: "200px" },
  //   );

  //   if (observerRef.current) {
  //     observer.observe(observerRef.current);
  //   }

  //   return () => observer.disconnect();
  // }, [loading, hasMore, fetching]);

  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [hasMore]);

  const handleToggleSave = async (recipeId) => {
    // 🔥 1. Optimistic update
    setRecipes((prev) =>
      prev.map((r) => (r._id === recipeId ? { ...r, isSaved: !r.isSaved } : r)),
    );

    try {
      // 🔥 2. Call API
      const res = await axios.post(
        `${base_url}/users/me/toggle-save/${recipeId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      console.log("toggle save recipe", res.data)
    } catch (err) {
      // ❌ 3. Revert if failed
      setRecipes((prev) =>
        prev.map((r) =>
          r._id === recipeId ? { ...r, isSaved: !r.isSaved } : r,
        ),
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
        <div>
          <h2 className="text-2xl font-semibold">
            Search results{" "}
            {query ? (
              <>
                for <span className="text-green-600">"{query}"</span>
              </>
            ) : null}
          </h2>
        </div>

        <div>
          <BackButton />
        </div>
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
          <RecipeCard key={r._id} recipe={r} onToggleSave={handleToggleSave}  />
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

      {/* 🔥 Sentinel */}
      <div ref={observerRef} className="h-10"></div>
    </div>
  );
};

export default DbSearch;
