import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import RecipeCard from "../../shared/RecipeCard";
import BackButton from "../../shared/BackButton";

const API_URL = `${base_url}/recipes`;

const SearchResults = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const rawQ = new URLSearchParams(search).get("q") ?? "";
  const query = rawQ.trim();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_URL}/search`, {
          params: { query },
          signal,
          headers: {
            // include token only if your search endpoint requires auth
            Authorization: localStorage.getItem("token")
              ? "Bearer " + localStorage.getItem("token")
              : undefined,
          },
        });

        console.log("Search result",res.data)
        const data = res.data;
        if (Array.isArray(data)) {
          setResults(data);
        } else if (data?.success && Array.isArray(data.data)) {
          setResults(data.data);
        } else if (data?.success && Array.isArray(data.data?.data)) {
          setResults(data.data.data);
        } else if (Array.isArray(data.items)) {
          setResults(data.items);
        } else {
          console.warn("Unexpected search response shape:", data);
          setResults([]);
        }
      } catch (err) {
        if (axios.isCancel && axios.isCancel(err)) {
          // request was cancelled
          return;
        }
        console.error("Search error", err?.response?.data ?? err.message ?? err);
        setError(err?.response?.data?.message || err.message || "Failed to search");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();

    return () => {
      controller.abort?.();
    };
  }, [query]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Search results {query ? <>for <span className="text-green-600">"{query}"</span></> : null}
        </h2>
        <BackButton/>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : results.length === 0 ? (
        <div className="p-6 rounded border text-gray-600">No results found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {results.map((r, i) => (
            <div key={r._id || r.id || i} className=" rounded-2xl shadow p-2">
              <RecipeCard recipe={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
