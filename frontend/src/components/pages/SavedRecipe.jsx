import React from "react";
import useRecipe from "../../hooks/useRecipe";
import RecipeCard from "../../shared/RecipeCard";
import { Backpack } from "lucide-react";
import BackButton from "../../shared/BackButton";

const SavedRecipe = () => {
  const { savedRecipes } = useRecipe();

  const cards = savedRecipes?.data || [];
  return (
    <div className=" flex flex-col gap-4">
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl md:text-3xl font-medium">Saved Recipes</h2>
        <BackButton />
      </div>

      <div className="w-full ">
        {cards.length === 0 ? (
          <div className="rounded-2xl p-6 border ">
            <p className="text-gray-600">No saved recipes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {cards.map((r, i) => (
              <div key={r._id || r.id || i} className=" rounded-2xl shadow p-2">
                <RecipeCard recipe={r} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRecipe;
