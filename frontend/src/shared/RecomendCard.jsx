import React, { useEffect } from "react";
import { Tag, TimeTag, PriceTag, CalorieTag } from "./Tag";
import { useNavigate } from "react-router-dom";
import defaultImg from "../assets/recipe.jpg";
import useSaveRecipe from "../hooks/useSaveRecipe";
import { Timer } from "lucide-react";
import calories from "../assets/Calories.png";

const RecomendCard = ({ recipe = {} }) => {
  const recipeId = recipe?._id;
  const { isSaved, isRecipeSaved, toggleSaveRecipe } = useSaveRecipe(recipeId);
  const navigate = useNavigate();

  useEffect(() => {
    isRecipeSaved(recipeId);
  }, []);

  const handleRecipe = (recipeId) => {
    if (!recipeId) return;
    navigate(`/dashboard/${recipeId}`);
  };

  const title = recipe?.title || "Untitled recipe";
  const imageSrc = recipe?.image || defaultImg;
  const description = recipe?.description || "No description available.";
  const md = recipe?.metadata || {};

  return (
    <div className="relative flex flex-col gap-3 bg-[#07466a] p-0.5 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Top badge / likes */}
      <div className="absolute z-10 top-3 right-3">
        <div className="flex ">
          
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
      </div>

      {/* Image block (keeps your height semantics but improves responsiveness) */}
      <div className="w-full overflow-hidden">
        <div className="relative w-full h-44 sm:h-48 md:h-60 lg:h-62 rounded-b-none rounded-2xl overflow-hidden">
          <img
            className="w-full h-full object-cover transform transition-transform duration-500 ease-out hover:scale-105"
            src={imageSrc}
            alt={title ?? "Recipe image"}
          />

          {/* subtle gradient overlay for legibility on hovering UI elements */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100"
          />
        </div>
      </div>

      {/* Buttons row — kept as separate block but visually elevated */}
      <div className=" -mt-16 mb-7 flex items-center justify-end">
        <div className="text-xs  text-zinc-500 dark:text-zinc-400 hidden sm:block z-20">
          <div className="bg-[#042d52] py-2 mx-1 rounded-tl-2xl rounded-br-2xl z-30 ">
            <span className="inline-flex items-center gap-2 px-3  text-sm font-medium  text-white ">
              Cooking Time: {md?.cookingTime}min
            </span>
          </div>
          <div className="bg-green-600 py-2 z-28 rounded-bl-2xl flex flex-row gap-2">
            <span className="inline-flex items-center gap-2 px-3  text-sm font-medium  text-gray-800 ">
              ₹{md?.costEstimate}
            </span>
            <span className="inline-flex items-center gap-2 px-3  text-sm font-medium  text-gray-800 ">
              <img src={calories} alt="" className="h-4 w-4" />
              {Math.trunc(md?.calories)}kcal
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="bg-[#08324a] -mt-18 pt-8 z-15 rounded-tl-3xl">
      <div className="px-6 pb-4">
        <h3
          className="text-xl -mt-3 w-[70%] sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-200 line-clamp-2"
          title={title}
        >
          {title}
        </h3>
        <p className="line-clamp-1 text-[#c6c4c4]">{description}</p>

        <div className="flex flex-row justify-between mt-3">
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
          <button
            type="button"
            onClick={() => handleRecipe(recipe?._id)}
            aria-label="View details"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium shadow-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition z-20 cursor-pointer"
          >
            Details
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RecomendCard;
