import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { BackButton, RecipeCard } from "../../shared";

const DbSearch = () => {
  const { search } = useLocation();
  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const query = (params.get("query") || "").trim();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${base_url}/recipes/db-search`, {
          params: params,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        console.log("Db search on result page", res.data);

        if (!cancelled) {
          setData(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Search fetch error:", err);
          setError(
            err.response?.data?.message || err.message || "Failed to fetch",
          );
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
  }, []);

  const handleRecipeClick = (recipe) => {
    navigate(`/dashboard/${recipe._id}`);
  };

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
              <RecipeCard
                key={r._id}
                recipe={r}
                onClick={() => handleRecipeClick(r)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DbSearch;
