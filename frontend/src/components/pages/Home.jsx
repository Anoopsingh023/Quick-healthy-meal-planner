import React from "react";
import recipeImg from "../../assets/recipe.jpg";
import useRecipe from "../../hooks/useRecipe";

const Home = () => {
  const items = ["veg", "Egg", "Potato", "Tomato"];
  const {recipe} = useRecipe()
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
        <div className="w-96 border p-3 flex flex-col gap-2 rounded-2xl">
          <h2 className="text-3xl font-semibold">Recipe Title</h2>
          <div className="flex flex-row gap-5">
            <img className="w-30 h-30 rounded-2xl" src={recipeImg} alt="img" />
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <div key={item} className=" p-1 px-2 h-8 text-sm bg-[#b7b2b2] rounded-full">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
