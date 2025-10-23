import React from "react";
import useRecipe from "../../hooks/useRecipe";
import { useParams } from "react-router-dom";
import recipeImg from "../../assets/recipe.jpg";
import calories from "../../assets/Calories.png";
import { Timer } from "lucide-react";
import Ingredients from "../../shared/Ingredients";
import { Tag, TimeTag, PriceTag, CalorieTag } from "../../shared/Tag";

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
            <img className="h-50 rounded-2xl" src={recipeById?.data.image} alt="" />
            <div className="flex flex-wrap gap-2">
              <TimeTag metadata={recipeById?.data?.metadata.cookingTime} />
              <CalorieTag
                metadata={Math.trunc(recipeById?.data?.metadata.calories)}
              />
              <PriceTag metadata={recipeById?.data?.metadata.costEstimate} />
              <Tag metadata={recipeById?.data.metadata.dietType} />
              <Tag metadata={recipeById?.data.metadata.cuisine} />
              <Tag metadata={recipeById?.data.metadata.difficulty} />
            </div>

            <div className="border p-4 rounded-2xl">
              <h4 className="text-2xl font-semibold mb-2 ">Ingredients</h4>
              <div className="flex flex-col gap-1">
                {recipeById?.data.ingredients.map((ingredient) => (
                  <Ingredients {...ingredient} />
                ))}
              </div>
            </div>
            <div className="border p-4 rounded-2xl">
              <h4 className="text-2xl font-semibold ">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {recipeById?.data.tags.map((tag, index) => (
                  <div key={index} className="flex flex-row gap-4">
                    <Tag metadata={tag} />
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
