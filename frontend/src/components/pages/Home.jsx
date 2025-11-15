import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useRecipe from "../../hooks/useRecipe";
import useShoppingList from "../../hooks/useShoppingList";
import { SliderCard, Search, Ingredients, RecipeCard, BadgesCard, Tag } from "../../shared";
import RecomendCard from "../../shared/RecomendCard";

const Home = () => {
  const items = ["veg", "Egg", "Potato", "Tomato"];
  const { recipe, savedRecipes, getSavedRecipes, getRandomRecipe } =
    useRecipe();
  const { shoppingList, getShoppingList } = useShoppingList();

  useEffect(() => {
    getSavedRecipes();
    getRandomRecipe();
    getShoppingList();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row  gap-6 pb-40">
      {/* col 1 */}
      <div className="flex-[4] flex flex-col justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl leading-tight">
            Cook Smart,
            <br /> Eat Healthy.
          </h1>
          <Search />

          <div className="flex flex-wrap gap-3 mt-4">
            {items.map((item) => (
              <div
                key={item}
              >
                <Tag metadata={item}/>
              </div>
            ))}
          </div>
        </div>

        <div className=" flex flex-col gap-4 w-3xl">
          <h2 className="text-2xl md:text-3xl font-medium">Browse Recipes</h2>
          <SliderCard cards={savedRecipes?.data || []} />
        </div>

        <div className="flex flex-col gap-4 w-md  ">
          <h2 className="text-2xl md:text-3xl font-medium ">Shopping List</h2>
          <div className="flex flex-col ">
            {shoppingList?.data.items.slice(0, 4).map((item) => (
              <div key={item._id} className="bg-[#cacaca] shadow-md px-4 py-1 m-0.5 rounded-sm">
                <Ingredients {...item} />
              </div>
            ))}
          </div>
          {shoppingList?.data.items.length > 4 && (
            <Link
              to="/dashboard/shopping-bag"
              state={{ items: shoppingList?.data.items }}
              className="self-start px-3 py-1 rounded bg-[#042d52] text-white hover:opacity-90"
            >
              More ({shoppingList?.data.items.length - 4} more)
            </Link>
          )}
        </div>
      </div>

      {/* col 2 */}
      <div className="flex-[3] flex flex-col justify-between gap-6">
        {/* Random Recipe Card */}
        <div className="">
          <RecomendCard recipe={recipe?.data} />
        </div>

        <div className="flex-[2]">
          <BadgesCard/>
        </div>
      </div>
    </div>
  );
};

export default Home;
