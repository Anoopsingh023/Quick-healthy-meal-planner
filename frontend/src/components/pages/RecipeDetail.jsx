import React from "react";
import useRecipe from "../../hooks/useRecipe";
import { useParams } from "react-router-dom";
import recipeImg from "../../assets/recipe.jpg";
import calories from "../../assets/Calories.png";
import { Timer } from "lucide-react";

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const { recipeById } = useRecipe(recipeId);
  console.log("Recipe on recipe page", recipeById);
  return (
    <div>
      <div>
        <h2 className="text-4xl font-medium">{recipeById?.data.title}</h2>
        <div className="flex">
          <div className="flex-2">
            <h4 className="text-2xl font-semibold px-4">Steps:</h4>
            <div>
              {recipeById?.data.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="flex flex-row gap-4 mx-4 my-2"
                >
                  <h3>{step.stepNumber}</h3>
                  <p>{step.instruction}</p>
                  {/* <span>{step.time}</span> */}
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-2xl font-semibold px-4 ">Description</h4>
              <div className="p-4">{recipeById?.data.description}</div>
            </div>
          </div>
          <div className="flex-1 flex gap-2 flex-col ">
            <img className="h-40 rounded-2xl" src={recipeImg} alt="" />
            <div className="flex flex-wrap gap-2">
              <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full flex flex-row">
                <Timer size={20} />
                {recipeById?.data?.metadata.cookingTime} min
              </p>
              <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full flex flex-row">
                <img className="h-5 w-5" src={calories} alt="" />
                {Math.trunc(recipeById?.data?.metadata.calories)} kcal
              </p>
              <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full flex flex-row items-center">
                Rs. {recipeById?.data?.metadata.costEstimate}
              </p>
              <span>
                {recipeById?.data?.metadata.dietType == "Any" ? null : (
                  <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                    {recipeById?.data.metadata.dietType}
                  </p>
                )}
              </span>
              <span>
                {recipeById?.data?.metadata.cuisine == "Any" ? null : (
                  <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                    {recipeById?.data.metadata.cuisine}
                  </p>
                )}
              </span>
              <span>
                {recipeById?.data?.metadata.difficulty == "Any" ? null : (
                  <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                    {recipeById?.data.metadata.difficulty}
                  </p>
                )}
              </span>
            </div>

            <div className="border p-4 rounded-2xl">
              <h4 className="text-2xl font-semibold ">Ingredients</h4>
              <div className="flex flex-col gap-1">
                {recipeById?.data.ingredients.map((ingredient) => (
                  <div
                    key={ingredient._id}
                    className="flex flex-row gap-4 justify-between "
                  >
                    <p>{ingredient.name}</p>
                    <span>{ingredient.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border p-4 rounded-2xl">
              <h4 className="text-2xl font-semibold ">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {recipeById?.data.tags.map((tag, index) => (
                  <div key={index} className="flex flex-row gap-4">
                    <p className="p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                      {tag}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
