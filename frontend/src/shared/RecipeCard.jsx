import React from "react";
import { Tag, TimeTag, PriceTag, CalorieTag } from "./Tag";
import { useNavigate } from "react-router-dom";

const RecipeCard = ({ recipe }) => {
  const navigate = useNavigate();
  const handleRecipe = (recipeId) => {
    navigate(`/dashboard/${recipeId}`);
  };
  return (
    <div className=" border p-3 flex flex-col gap-2 rounded-2xl">
      <h2
        onClick={() => handleRecipe(recipe?._id)}
        className="text-3xl font-semibold cursor-pointer hover:text-[#4b4b4b] duration-300"
      >
        {recipe?.title}
      </h2>
      <div className="flex flex-row gap-5">
        <img
          onClick={() => handleRecipe(recipe._id)}
          className="w-50 h-30 rounded-2xl cursor-pointer"
          src={recipe?.image}
          alt="img"
        />
        <p className=" line-clamp-3">{recipe?.description}</p>
      </div>
      <div className="flex flex-row flex-wrap gap-2 text-xs">
        <TimeTag metadata={recipe?.metadata.cookingTime} />
        <CalorieTag metadata={recipe?.metadata.calories} />
        <PriceTag metadata={recipe?.metadata.costEstimate} />
        <Tag metadata={recipe?.metadata.dietType} />
        <Tag metadata={recipe?.metadata.cuisine} />
        <Tag metadata={recipe?.metadata.difficulty} />
      </div>
    </div>
  );
};

export default RecipeCard;
