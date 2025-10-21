import React from "react";
import recipeImg from "../../assets/recipe.jpg";
import useRecipe from "../../hooks/useRecipe";
import calories from "../../assets/Calories.png";
import { Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const items = ["veg", "Egg", "Potato", "Tomato"];
  const { recipe, savedRecipes } = useRecipe();
  const navigate = useNavigate()
  // console.log("Home saved recipes", savedRecipes);
  const handleRecipe = (recipeId)=>{
    navigate(`/dashboard/${recipeId}`)
  }

  return (
    <div className="flex flex-col px-10">
      <div className="flex flex-row justify-between">
        <div className="w-[50%]">
          <h1 className="font-bold text-7xl">
            Cook Smart,
            <br /> Eat Healthy.
          </h1>
          <input
            className="w-full px-5 py-2 my-5 border rounded-2xl"
            type="text"
            placeholder="Search recipes, ingredients or cuisines"
          />
          <div className="flex flex-row gap-5">
            {items.map((item) => (
              <div key={item} className="px-4 py-2 bg-[#b7b2b2] rounded-full">
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Random Recipes */}
        <div className=" border p-3 flex flex-col gap-2 rounded-2xl">
          <h2 onClick={()=>handleRecipe(recipe?.data._id)} className="text-3xl font-semibold cursor-pointer">{recipe?.data?.title}</h2>
          <div className="flex flex-row gap-5">
            <img onClick={()=>handleRecipe(recipe?.data._id)} className="w-30 h-30 rounded-2xl cursor-pointer" src={recipeImg} alt="img" />
            <div className="flex flex-wrap gap-2">
              <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                {recipe?.data?.metadata.dietType}
              </p>
              <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                {recipe?.data?.metadata.cuisine}
              </p>
              <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                {recipe?.data?.metadata.difficulty}
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full flex flex-row">
              <Timer size={20} />
              {recipe?.data?.metadata.cookingTime} min
            </p>
            <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full flex flex-row">
              <img className="h-5 w-5" src={calories} alt="" />
              {Math.trunc(recipe?.data?.metadata.calories)} kcal
            </p>
            <p className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full flex flex-row items-center">
              Rs. {recipe?.data?.metadata.costEstimate}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-medium">Browse Recipe</h2>
        <div className="flex flex-row gap-4">
          {savedRecipes?.data.map((savedRecipe) => (
            <div
              key={savedRecipe._id}
              className="flex flex-col gap-2 p-4 border rounded-2xl"
            >
              <img src={recipeImg} alt="" />
              <h2>{savedRecipe.title}</h2>
              <div className="flex flex-row gap-2">
              <p className="p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full ">{savedRecipe.metadata.cookingTime}</p>
              <p className="p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">{savedRecipe.metadata.cuisine}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
