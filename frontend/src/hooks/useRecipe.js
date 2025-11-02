import React, { useEffect, useState } from "react";
import axios from "axios"
import { base_url } from "../utils/constant";

const useRecipe = (recipeId)=>{
    const [recipe, setRecipe] = useState()
    const [savedRecipes, setSavedRecipes]= useState()
    const [recipeById, setRecipeById] = useState()

    const getRandomRecipe = async()=>{
        try {
            const res = await axios.get(`${base_url}/recipes/recommend`,{
                headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
            })
            console.log("Random recipe",res.data)
            const recipedata = res.data
            setRecipe(recipedata)
            

        } catch (error) {
            console.log("Random recipe Error", error)
        }
    }

    const getSavedRecipes = async()=>{
        try {
            const res = await axios.get(`${base_url}/users/me/saved-recipes`,{
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            })
            console.log("Saved Recipe",res.data)
            setSavedRecipes(res.data||[])
        } catch (error) {
            console.log("Error in saved recipe",error)
        }
    }

    const getRecipeById = async()=>{
        try {
            const res = await axios.get(`${base_url}/recipes/re/${recipeId}`,{
                headers:{
                    Authorization: "Bearer " + localStorage.getItem("token")
                }
            })
            console.log("Recipe by id",res.data)
            setRecipeById(res.data || [])
        } catch (error) {
            console.log("Error in recipe by id",error)
        }
    }

    useEffect(()=>{
        // getRandomRecipe()
        // getSavedRecipes()
        // getRecipeById()
    },[])
    return {recipe, savedRecipes, recipeById, getRecipeById: getRecipeById, getSavedRecipes:getSavedRecipes, getRandomRecipe:getRandomRecipe}
}
export default useRecipe