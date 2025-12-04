import React, { useEffect, useState } from "react";
import axios from "axios"
import { base_url } from "../utils/constant";

const useSaveRecipe = (recipeId) => {
    const [isSaved, setIsSaved] = useState();

  const toggleSaveRecipe = async (recipeId) => {
    try {
      const res = await axios.post(
        `${base_url}/users/me/toggle-save/${recipeId}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      console.log("Recipe Saved", res.data);
      isRecipeSaved(recipeId);
    } catch (error) {
      console.log("Error in save recipe", error);
    }
  };

  const isRecipeSaved = async (recipeId) => {
    try {
      const res = await axios.get(`${base_url}/users/is-saved/${recipeId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log("Is Recipe Saved", res.data);
      setIsSaved(res.data.data.isSaved);
    } catch (error) {
      console.log("Error in is recipe saved", error);
    }
  };
  return {isSaved, toggleSaveRecipe:toggleSaveRecipe, isRecipeSaved:isRecipeSaved}
}

export default useSaveRecipe