import React, { useEffect, useState } from "react";
import useRecipe from "../../hooks/useRecipe";
import { useLocation, useParams } from "react-router-dom";
import Ingredients from "../../shared/Ingredients";
import { Tag, TimeTag, PriceTag, CalorieTag } from "../../shared/Tag";
import axios from "axios";
import { base_url } from "../../utils/constant";
import BackButton from "../../shared/BackButton";

const RecipeDetail = () => {
  const location = useLocation();
const recipe = location.state?.recipe;
  const { recipeId } = useParams();
  const { recipeById, getRecipeById } = useRecipe(recipeId);
  const [isSaved, setIsSaved] = useState();
  const [detailedRecipe, setDetailedRecipe] = useState()

  const toggleSaveRecipe = async (recipeId) => {
    try {
      const res = await axios.post(
        `${base_url}/users/me/toggle-save/${recipeId}`,
        {},
        {
          withCredentials: true
        }
      );
      console.log("Recipe Saved", res.data);
      isRecipeSaved();
    } catch (error) {
      console.log("Error in save recipe", error);
    }
  };

  const isRecipeSaved = async (recipeById) => {
    try {
      const res = await axios.get(`${base_url}/users/is-saved/${recipeId}`, {
        withCredentials: true
      });
      console.log("Is Recipe Saved", res.data);
      setIsSaved(res.data.data.isSaved);
    } catch (error) {
      console.log("Error in save recipe", error);
    }
  };

  const addToShoppingList = async (recipeId) =>{
    try {
      const res = await axios.post(`${base_url}/shopinglists/generate/${recipeId}`,{}, {
        withCredentials: true
      });
      console.log("Added to shopping list", res.data);
      // setIsSaved(res.data.data.isSaved);
    } catch (error) {
      console.log("Error in add to shopping list", error)
    }
  }

  useEffect(() => {
    isRecipeSaved();
    if(recipe){
      setDetailedRecipe(recipe)
    }
    getRecipeById();
  }, []);

  return (
    <div>
      <div className="flex flex-row justify-between w-3xl">
        <h2 className="text-4xl font-medium">{recipeById?.data.title}</h2>
        <BackButton />
      </div>
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
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-2xl font-semibold px-4 ">Description</h4>
            <div className="p-4">{recipeById?.data.description}</div>
            {isSaved ? (
              <button
                onClick={() => toggleSaveRecipe(recipeById?.data._id)}
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
            )}
          </div>
        </div>
        <div className="flex-1 flex gap-2 flex-col ">
            <img
              className="h-50 w-full rounded-2xl shadow-md"
              src={recipeById?.data.image}
              alt=""
            />
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
         

          {/* <div className="bg-[#cacaca] shadow-md p-4 rounded-2xl">
            <h4 className="text-2xl font-semibold mb-2 ">Ingredients</h4>
            <div className="flex flex-col gap-1 ">
              {recipeById?.data.ingredients.map((ingredient) => (
                <div key={ingredient._id}>
                  <Ingredients {...ingredient} />
                </div>
              ))}
            </div>
          </div> */}
          <div className="bg-[#cacaca] shadow-md p-4 rounded-2xl">
            <h4 className="text-2xl font-semibold mb-2 ">Tags</h4>
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
      <div className=" p-4 rounded-2xl">
        <div className="flex flex-row justify-between mb-4">
            <h4 className="text-2xl font-semibold mb-2 ">Ingredients</h4>
            <button onClick={()=>addToShoppingList(recipeId)} className="px-4 py-2 bg-green-500">Add</button>
        </div>

            <div className="grid grid-cols-7 flex-wrap gap-4 ">
              {recipeById?.data.ingredients.map((ingredient) => (
                <div key={ingredient._id}>
                  <Ingredients {...ingredient} />
                </div>
              ))}
            </div>
          </div>
    </div>
  );
};

export default RecipeDetail;
