import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import useRecipe from "../../hooks/useRecipe";
import Ingredients from "../../shared/Ingredients";
import { Tag, TimeTag, PriceTag, CalorieTag } from "../../shared/Tag";
import BackButton from "../../shared/BackButton";
import { useSavedStore } from "../../store/useSavedStore";
// ─── RecipeDetail ──────────────────────────────────────────────────────────────
const RecipeDetail = () => {
  const { recipeId } = useParams();
  const { recipeById, getRecipeById } = useRecipe(recipeId);

  const { checkSaved, toggle: toggleSave } = useSavedStore();

  const [addingToList, setAddingToList] = useState(false);
  const [listAdded, setListAdded] = useState(false);

  useEffect(() => {
    getRecipeById();
  }, [recipeId]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleToggleSave = useCallback(() => {
    if (!recipeById?.data?._id) return;
    toggleSave(recipeById.data._id);
  }, [recipeById, toggleSave]);

  const handleAddToShoppingList = useCallback(async () => {
    if (addingToList || listAdded) return;
    setAddingToList(true);
    try {
      await axios.post(
        `${base_url}/shopinglists/generate/${recipeId}`,
        {},
        { withCredentials: true },
      );
      setListAdded(true);
    } catch (err) {
      console.error("Add to shopping list error", err);
    } finally {
      setAddingToList(false);
    }
  }, [recipeId, addingToList, listAdded]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const recipe = recipeById?.data;
  const saved = recipe ? checkSaved(recipe._id) : false;
  const metadata = recipe?.metadata;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!recipe) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-lg animate-pulse">Loading recipe…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-4xl font-medium">{recipe.title}</h2>
        <BackButton />
      </div>

      {/* ── Main content ── */}
      <div className="flex gap-6">
        {/* Left — steps + description + save */}
        <div className="flex-[2] flex flex-col gap-6">
          <div>
            <h4 className="text-2xl font-semibold px-4 mb-2">Steps</h4>
            <div className="flex flex-col gap-2">
              {recipe.steps.map((step) => (
                <div key={step.stepNumber} className="flex flex-row gap-4 mx-4">
                  <span className="font-bold text-green-600 min-w-[1.5rem]">
                    {step.stepNumber}
                  </span>
                  <p className="text-gray-700">{step.instruction}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-2xl font-semibold px-4 mb-2">Description</h4>
            <p className="px-4 text-gray-600">{recipe.description}</p>
          </div>

          {/* Save button — reads live from savedStore, no extra API call */}
          <button
            onClick={handleToggleSave}
            className={`self-start px-6 py-2 rounded-md font-medium transition-all duration-200 text-white
              ${
                saved
                  ? "bg-green-700 border border-green-800 hover:bg-green-800"
                  : "bg-green-600 shadow-lg hover:bg-green-700"
              }`}
          >
            {saved ? "✓ Saved" : "Save"}
          </button>
        </div>

        {/* Right — image + meta tags */}
        <div className="flex-1 flex flex-col gap-3">
          <img
            className="h-50 w-full rounded-2xl shadow-md object-cover"
            src={recipe.image}
            alt={recipe.title}
          />

          <div className="flex flex-wrap gap-2">
            <TimeTag metadata={metadata?.cookingTime} />
            <CalorieTag metadata={Math.trunc(metadata?.calories ?? 0)} />
            <PriceTag metadata={metadata?.costEstimate} />
            <Tag metadata={metadata?.dietType} />
            <Tag metadata={metadata?.cuisine} />
            <Tag metadata={metadata?.difficulty} />
          </div>

          <div className="bg-[#cacaca] shadow-md p-4 rounded-2xl">
            <h4 className="text-xl font-semibold mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, i) => (
                <Tag key={i} metadata={tag} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Ingredients ── */}
      <div className="p-4 rounded-2xl">
        <div className="flex flex-row justify-between items-center mb-4">
          <h4 className="text-2xl font-semibold">Ingredients</h4>
          <button
            onClick={handleAddToShoppingList}
            disabled={addingToList || listAdded}
            className={`px-4 py-2 rounded-md text-white font-medium transition-all duration-200
              ${
                listAdded
                  ? "bg-gray-400 cursor-default"
                  : "bg-green-500 hover:bg-green-600 cursor-pointer"
              }`}
          >
            {listAdded ? "Added ✓" : addingToList ? "Adding…" : "Add to List"}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4 flex-wrap">
          {recipe.ingredients.map((ingredient) => (
            <Ingredients key={ingredient._id} {...ingredient} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
