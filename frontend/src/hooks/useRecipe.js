import React, { useEffect, useState } from "react";
import axios from "axios"
import { base_url } from "../utils/constant";

const useRecipe = ()=>{
    const [recipe, setRecipe] = useState()

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

    useEffect(()=>{
        getRandomRecipe()
    },[])
    return {recipe}
}
export default useRecipe