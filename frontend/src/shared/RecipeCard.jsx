import React, { useEffect } from "react";
import { TimeTag, CalorieTag } from "./Tag";
import { useNavigate } from "react-router-dom";
import defaultImg from "../assets/recipe.jpg";
import useSaveRecipe from "../hooks/useSaveRecipe";
import axios from "axios";
import { base_url } from "../utils/constant";
import LazyImage from "./LazyImage";

const RecipeCard = ({ recipe, onToggleSave = () => {} }) => {
  const navigate = useNavigate();
  const recipeId = recipe?._id;

  // const { isSaved,isRecipeSaved, toggleSaveRecipe } = useSaveRecipe(recipeId);

  // useEffect(()=>{
  //   isRecipeSaved(recipeId)
  // },[])

  const handleRecipe = () => {
    navigate(`/dashboard/${recipe._id}`, {
      state: { recipe },
    });
  };

  

  const handleDelete = async (recipeId) => {
    try {
      const res = await axios.delete(
        `${base_url}/recipes/re/delete/${recipeId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );
      console.log("Recipe by id delete", res.data);
      // setRecipeById(res.data || []);
    } catch (error) {
      console.log("Error in recipe by id delete", error);
    }
  };

  const title = recipe?.title || "Untitled recipe";
  const image = recipe?.image || defaultImg;
  const md = recipe?.metadata || {};

  return (
    <div
      onClick={handleRecipe}
      className="group relative rounded-2xl overflow-hidden cursor-pointer 
      bg-white/5 backdrop-blur-lg border border-white/10 
      shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
    >
      {/* IMAGE */}
      <div className="relative h-52 overflow-hidden">
        {/* <img
          src={image}
          className="w-full h-full object-cover  transition-transform duration-500 group-hover:scale-110"
        /> */}
        <LazyImage
  src={recipe.image}
  alt={recipe.title}
  // className="h-40 rounded-lg"
  className="w-full h-full object-cover  transition-transform duration-500 group-hover:scale-110"
/>

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* SAVE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(recipe?._id);
          }}
          className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition"
        >
          {recipe?.isSaved ? "❤️" : "🤍"}
        </button>

        {/* TITLE ON IMAGE */}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-4">
        <div className=" ">
          {/* <button
            onClick={() => handleDelete(recipe._id)}
            className="text-xl text-red-600 hover:text-red-800 cursor-pointer z-90"
          >
            X
          </button> */}
          <h3 className=" font-semibold text-lg line-clamp-1">{title}</h3>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex gap-2">
            <CalorieTag metadata={md?.calories} />
            <TimeTag metadata={md?.cookingTime} />
          </div>

          {/* CTA */}
          <span className="text-md text-green-600 opacity-0 group-hover:opacity-100 transition">
            View →
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
