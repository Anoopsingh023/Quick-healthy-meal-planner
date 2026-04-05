import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { base_url } from "../../utils/constant";
import axios from "axios";
import {
  BackButton,
  CalorieTag,
  Ingredients,
  PriceTag,
  Tag,
  TimeTag,
} from "../../shared";
// import { Tag } from 'lucide-react';

const API_URL = `${base_url}/recipes`;

const parseNumber = (v) => {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const AiRecipePage = () => {
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

        // let res;
        const res = await axios.post(
          `${API_URL}/generate-ai`,
          {
            query,
            cuisine,
            dietType,
            difficulty,
            costMin,
            costMax,
          },
          {
            headers: {
              Authorization: localStorage.getItem("token")
                ? "Bearer " + localStorage.getItem("token")
                : undefined,
            },
          },
        );
        console.log("Ai recipe generation", res.data.data);

        const data = res?.data;
        setResults(data)
        
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
  return (
    <div>
      <div className="flex flex-row justify-between w-3xl">
        <h2 className="text-4xl text-red-700 font-medium">{results?.data?.title}</h2>
        <BackButton />
      </div>

      <div className="flex">
        <div className="flex-2">
          <h4 className="text-2xl font-semibold px-4">Steps:</h4>
          <div>
            {results?.data.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="flex flex-row gap-4 mx-4 my-2"
              >
                <h3>{step.stepNumber}</h3>
                <p>{step.instruction}</p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-2xl font-semibold px-4 ">Description</h4>
            <div className="p-4">{results?.data.description}</div>
            {/* {isSaved ? (
              <button
                // onClick={() => toggleSaveRecipe(recipeById?.data._id)}
                className="border px-4 py-1 cursor-pointer rounded-md h-10  bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
              >
                Saved
              </button>
            ) : (
              <button
                onClick={() => toggleSaveRecipe(recipeById?.data._id)}
                className=" px-4 py-1 cursor-pointer rounded-md h-10  bg-green-600 shadow-lg text-white hover:bg-green-700 transition-all duration-200"
              >
                Save
              </button>
            )} */}
          </div>
        </div>
        <div className="flex-1 flex gap-2 flex-col ">
            <img
              className="h-50 w-full rounded-2xl shadow-md"
              src={results?.data.image}
              alt=""
            />
            <div className="flex flex-wrap gap-2">
              <TimeTag metadata={results?.data?.metadata.cookingTime} />
              <CalorieTag
                metadata={Math.trunc(results?.data?.metadata.calories)}
              />
              <PriceTag metadata={results?.data?.metadata.costEstimate} />
              <Tag metadata={results?.data.metadata.dietType} />
              <Tag metadata={results?.data.metadata.cuisine} />
              <Tag metadata={results?.data.metadata.difficulty} />
            </div>
         

          <div className="bg-[#cacaca] shadow-md p-4 rounded-2xl">
            <h4 className="text-2xl font-semibold mb-2 ">Ingredients</h4>
            <div className="flex flex-col gap-1 ">
              {results?.data.ingredients.map((ingredient) => (
                <div key={ingredient._id}>
                  <Ingredients {...ingredient} />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#cacaca] shadow-md p-4 rounded-2xl">
            <h4 className="text-2xl font-semibold mb-2 ">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {results?.data.tags.map((tag, index) => (
                <div key={index} className="flex flex-row gap-4">
                  <Tag metadata={tag} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className=" p-4 rounded-2xl">
        <div className="flex flex-row justify-between mb-4">
          <h4 className="text-2xl font-semibold mb-2 ">Ingredients</h4>
          {/* <button onClick={()=>addToShoppingList(recipeId)} className="px-4 py-2 bg-green-500">Add</button> */}
        </div>

        <div className="grid grid-cols-7 flex-wrap gap-4 ">
          {results?.data.ingredients.map((ingredient) => (
            <div key={ingredient._id}>
              <Ingredients {...ingredient} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiRecipePage;
