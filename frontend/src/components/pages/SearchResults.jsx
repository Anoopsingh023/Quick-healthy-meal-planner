// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { base_url } from "../../utils/constant";
// import RecipeCard from "../../shared/RecipeCard";
// import BackButton from "../../shared/BackButton";

// const API_URL = `${base_url}/recipes`;

// const SearchResults = () => {
//   const navigate = useNavigate();
//   const { search } = useLocation();
//   const rawQ = new URLSearchParams(search).get("q") ?? "";
//   const query = rawQ.trim();

//   const [loading, setLoading] = useState(false);
//   const [results, setResults] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!query) {
//       setResults([]);
//       setError(null);
//       setLoading(false);
//       return;
//     }

//     const controller = new AbortController();
//     const signal = controller.signal;

//     const fetchResults = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await axios.get(`${API_URL}/search`, {
//           params: { query },
//           signal,
//           headers: {
//             // include token only if your search endpoint requires auth
//             Authorization: localStorage.getItem("token")
//               ? "Bearer " + localStorage.getItem("token")
//               : undefined,
//           },
//         });

//         console.log("Search result",res.data)
//         const data = res.data;
//         if (Array.isArray(data)) {
//           setResults(data);
//         } else if (data?.success && Array.isArray(data.data)) {
//           setResults(data.data);
//         } else if (data?.success && Array.isArray(data.data?.data)) {
//           setResults(data.data.data);
//         } else if (Array.isArray(data.items)) {
//           setResults(data.items);
//         } else {
//           console.warn("Unexpected search response shape:", data);
//           setResults([]);
//         }
//       } catch (err) {
//         if (axios.isCancel && axios.isCancel(err)) {
//           // request was cancelled
//           return;
//         }
//         console.error("Search error", err?.response?.data ?? err.message ?? err);
//         setError(err?.response?.data?.message || err.message || "Failed to search");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResults();

//     return () => {
//       controller.abort?.();
//     };
//   }, [query]);

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-2xl font-semibold">
//           Search results {query ? <>for <span className="text-green-600">"{query}"</span></> : null}
//         </h2>
//         <BackButton/>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : error ? (
//         <div className="text-red-600">Error: {error}</div>
//       ) : results.length === 0 ? (
//         <div className="p-6 rounded-2xl bg-[#cacaca] text-gray-600">No results found.</div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {results.map((r, i) => (
//             <div key={r._id || r.id || i} className="  ">
//               <RecipeCard recipe={r} />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchResults;


import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import RecipeCard from "../../shared/RecipeCard";
import BackButton from "../../shared/BackButton";

const API_URL = `${base_url}/recipes`;

const parseNumber = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const SearchResults = () => {
  const { search } = useLocation();
  const params = React.useMemo(() => new URLSearchParams(search), [search]);

  // read the params we expect (Search component builds these)
  const query = (params.get("query") || "").trim();
  const cuisine = params.get("cuisine") || ""; // comma-separated
  const dietType = params.get("dietType") || "";
  const difficulty = params.get("difficulty") || "";
  const costMin = parseNumber(params.get("costMin"));
  const costMax = parseNumber(params.get("costMax"));
  const sort = params.get("sort") || "";
  const limit = parseNumber(params.get("limit")) || 12;

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

        const res = await axios.get(`${API_URL}/search`, {
          params: reqParams,
          signal,
          headers: {
            Authorization: localStorage.getItem("token")
              ? "Bearer " + localStorage.getItem("token")
              : undefined,
          },
        });

        // Useful debug while developing - remove if noisy
        // console.info("Search result (raw):", res);

        const data = res?.data;

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
        setLoading(false);
      }
    };

    fetchResults();

    return () => {
      // abort when component unmounts or params change
      controller.abort();
    };
    // Re-run effect whenever the raw search string changes
  }, [query, cuisine, dietType, difficulty, costMin, costMax, sort, limit, search]);

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

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : results.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#f3f4f6] text-gray-600">
          No results found.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {results.map((r, i) => (
            <div key={r._id || r.id || i}>
              <RecipeCard recipe={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
