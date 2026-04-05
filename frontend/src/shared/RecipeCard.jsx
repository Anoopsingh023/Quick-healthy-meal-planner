import React, { useEffect } from "react";
import { Tag, TimeTag, PriceTag, CalorieTag } from "./Tag";
import { useNavigate } from "react-router-dom";
import defaultImg from "../assets/recipe.jpg";
import useSaveRecipe from "../hooks/useSaveRecipe";

const RecipeCard = ({ recipe = {} }) => {
  const recipeId = recipe?._id;
  const { isSaved, isRecipeSaved, toggleSaveRecipe } = useSaveRecipe(recipeId);
  const navigate = useNavigate();

  useEffect(() => {
    // isRecipeSaved(recipeId);
  }, []);

  const handleRecipe = (recipe) => {
    if (!recipe) return;
    navigate(`/dashboard/${recipe._id}`, {
      state: { recipe: recipe },
    });
  };

  const title = recipe?.title || "Untitled recipe";
  const imageSrc = recipe?.image || defaultImg;
  const description = recipe?.description || "No description available.";
  const md = recipe?.metadata || {};

  return (
    <div className="relative flex flex-col gap-3 bg-[#08324a]  rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Top badge / likes */}
      <div className="absolute z-10 top-3 left-3">
        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm ring-1 ring-rose-200/30">
          {/* heart icon (inline SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 21s-7-4.35-9-6.6C1.58 11.9 3.7 7 8.3 7c1.9 0 3.2.9 3.7 1.6.5-.7 1.8-1.6 3.7-1.6 4.6 0 6.7 4.9 5.3 7.4C19 16.65 12 21 12 21z" />
          </svg>
          <span>10k Likes</span>
        </span>
      </div>

      {/* Image block (keeps your height semantics but improves responsiveness) */}
      <div className="w-full overflow-hidden">
        <div className="relative w-full h-44 sm:h-48 md:h-60 lg:h-52 rounded-b-none rounded-2xl overflow-hidden">
          {/* <img
            onClick={() => handleRecipe(recipe)}
            className="w-full h-full object-cover transform transition-transform duration-500 ease-out hover:scale-105 cursor-pointer"
            src={imageSrc}
            alt={title ?? "Recipe image"}
          /> */}

          {recipe.image ? (
            <img
              src={recipe.image}
              onClick={() => handleRecipe(recipe)}
              className="w-full h-full object-cover transform transition-transform duration-500 ease-out hover:scale-105 cursor-pointer"
            />
          ) : (
            <div className="h-40 bg-gray-200 animate-pulse rounded-xl" />
          )}

          {/* subtle gradient overlay for legibility on hovering UI elements */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100"
          />
        </div>
      </div>

      {/* Buttons row — kept as separate block but visually elevated */}
      {/* <div className="px-6 -mt-8 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleRecipe(recipe?._id)}
            aria-label="View details"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-md hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition z-20 cursor-pointer"
          >
            Details
          </button>

          {isSaved ? (
            <button
              type="button"
              onClick={() => toggleSaveRecipe(recipeId)}
              aria-label="Save recipe"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-zinc-800 border border-emerald-600 text-emerald-600 dark:text-emerald-300 text-sm font-medium shadow-sm hover:bg-emerald-50 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition z-20 cursor-pointer"
            >
              Saved
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleSaveRecipe(recipeId)}
              aria-label="Save recipe"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-zinc-800 border border-emerald-600 text-emerald-600 dark:text-emerald-300 text-sm font-medium shadow-sm hover:bg-emerald-50 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition z-20 cursor-pointer"
            >
              Save
            </button>
          )}
        </div>

        <div className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
        
        </div>
      </div> */}

      {/* Title */}
      <div className="px-2 pb-4">
        <h3
          className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-200 line-clamp-1"
          title={title}
          onClick={() => handleRecipe(recipe)}
        >
          {title}
        </h3>

        {/* tags / meta row */}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <CalorieTag metadata={md?.calories} />
          </div>

          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <TimeTag metadata={md?.cookingTime} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
