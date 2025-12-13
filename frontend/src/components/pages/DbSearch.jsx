// src/pages/SearchResults.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
// import { base_url } from "../utils/constant";
import { base_url } from "../../utils/constant";
import { BackButton, RecipeCard } from "../../shared";


/**
 * Local uploaded file path (tooling will transform this into a URL if needed)
 * (per your request: send the local path so the toolchain can transform it)
 */
const uploadedModelPath = "sandbox:/mnt/data/recipe.model.js";

const parseQuery = (search) => {
  const params = new URLSearchParams(search);
  return {
    q: params.get("q") || "",
    cuisine: params.get("cuisine") || "",
    dietType: params.get("dietType") || "",
    foodType: params.get("foodType") || "",
    tags: params.get("tags") || "",
    page: parseInt(params.get("page") || "1", 10),
    limit: parseInt(params.get("limit") || "12", 10),
  };
};

const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.cuisine) params.set("cuisine", filters.cuisine);
  if (filters.dietType) params.set("dietType", filters.dietType);
  if (filters.foodType) params.set("foodType", filters.foodType);
  if (filters.tags) params.set("tags", filters.tags);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  return params.toString();
};

// const RecipeCard = ({ recipe, onClick }) => {
//   const thumb = recipe.image || ""; // fallback if you have default image, use it
//   return (
//     <div
//       className="flex flex-col gap-4 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-white"
//       onClick={onClick}
//       role="button"
//       tabIndex={0}
//       onKeyDown={(e) => (e.key === "Enter" ? onClick() : null)}
//     >
//       <div className="w-28 h-20 flex-shrink-0 overflow-hidden rounded-md">
//         {thumb ? (
//           <img className="w-full h-full object-cover" src={thumb} alt={recipe.title} />
//         ) : (
//           <div className="w-full h-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-sm text-gray-500">
//             No Image
//           </div>
//         )}
//       </div>

//       <div className="flex-1">
//         <h3 className="text-lg font-semibold line-clamp-1">{recipe.title}</h3>
//         <p className="text-sm text-zinc-500 line-clamp-2">{recipe.description}</p>

//         <div className="mt-2 flex flex-wrap gap-2 text-xs">
//           {recipe.metadata?.cuisine && (
//             <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700">{recipe.metadata.cuisine}</span>
//           )}
//           {recipe.metadata?.dietType && (
//             <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700">{recipe.metadata.dietType}</span>
//           )}
//           {(recipe.metadata?.foodType || recipe.tags)?.slice?.(0, 3).map((t, i) => (
//             <span key={i} className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700">{t}</span>
//           ))}
//         </div>
//       </div>

//       <div className="text-right text-xs text-zinc-400">
//         <div>{recipe.metadata?.cookingTime ? `${recipe.metadata.cookingTime} min` : ""}</div>
//         <div className="mt-2">{recipe.source || ""}</div>
//       </div>
//     </div>
//   );
// };

const DbSearch = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(() => parseQuery(location.search));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recompute filters when URL changes
  useEffect(() => {
    setFilters(parseQuery(location.search));
  }, [location.search]);

  // Memoize params object sent to API to avoid unnecessary fetches
  const apiParams = useMemo(() => {
    const p = {};
    if (filters.q) p.q = filters.q;
    if (filters.cuisine) p.cuisine = filters.cuisine;
    if (filters.dietType) p.dietType = filters.dietType;
    if (filters.foodType) p.foodType = filters.foodType;
    if (filters.tags) p.tags = filters.tags;
    p.page = filters.page || 1;
    p.limit = filters.limit || 12;
    return p;
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${base_url}/recipes/db-search`, {
          params: apiParams,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });

        if (!cancelled) {
          setData(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Search fetch error:", err);
          setError(err.response?.data?.message || err.message || "Failed to fetch");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResults();

    return () => {
      cancelled = true;
    };
  }, [apiParams]);

  const goToPage = (page) => {
    const next = { ...filters, page };
    const qs = buildQueryString(next);
    navigate(`/dashboard/search?${qs}`);
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/dashboard/${recipe._id}`);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Debug: show uploaded model path (tooling will transform this path). Remove in production if not needed. */}
      <div className="text-xs text-zinc-400 mb-3">model file path: {uploadedModelPath}</div>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Search results</h2>
          <p className="text-sm text-zinc-500">
            Showing results for{" "}
            <span className="font-medium">{filters.q || filters.foodType || filters.cuisine || "all"}</span>
          </p>
        </div>

        <div>
          <BackButton/>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="py-8 text-center text-zinc-500">Loading recipes…</div>
      )}

      {error && (
        <div className="py-4 text-center text-red-500">Error: {error}</div>
      )}

      {/* Results */}
      {!loading && data && data.data && data.data.length === 0 && (
        <div className="py-8 text-center text-zinc-500">
          No recipes found. Try different filters.
        </div>
      )}

      {!loading && data && data.data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-4">
            {data.data.map((r) => (
            //   <RecipeCard key={r._id} recipe={r} onClick={() => handleRecipeClick(r)} />
              <RecipeCard key={r._id} recipe={r} onClick={() => handleRecipeClick(r)} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Showing page {data.meta.page} of {data.meta.pages} • {data.meta.total} results
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-md border"
                onClick={() => goToPage(Math.max(1, (filters.page || 1) - 1))}
                disabled={(filters.page || 1) <= 1}
              >
                Prev
              </button>

              <span className="px-3 py-1 text-sm">{filters.page}</span>

              <button
                className="px-3 py-1 rounded-md border"
                onClick={() => goToPage(Math.min(data.meta.pages, (filters.page || 1) + 1))}
                disabled={(filters.page || 1) >= data.meta.pages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DbSearch;
