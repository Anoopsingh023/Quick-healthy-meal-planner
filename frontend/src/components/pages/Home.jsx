import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useRecipe from "../../hooks/useRecipe";
import useShoppingList from "../../hooks/useShoppingList";
import {
  SliderCard,
  Search,
  Ingredients,
  RecipeCard,
  BadgesCard,
  Tag,
} from "../../shared";
import RecomendCard from "../../shared/RecomendCard";
import logo from "../../assets/logo.jpg";
import download from "../../assets/recipe/download.jpg";
import Cusiene from "../../shared/Cusiene";
import Footer from "./Footer";
import IndianCusiene from "../../shared/IndianCusiene";

const Home = () => {
  const items = ["veg", "Egg", "Potato", "Tomato"];
  const { recipe, savedRecipes, getSavedRecipes, getRandomRecipe } =
    useRecipe();
  const { shoppingList, getShoppingList } = useShoppingList();

  useEffect(() => {
    // getSavedRecipes();
    getRandomRecipe();
    getShoppingList();
  }, []);

  return (
    <div className="flex flex-col sm:flex-col gap-6 ">
      <div className=" flex flex-row justify-between gap-6">
        <div className="flex-[3] flex flex-col">
          <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl leading-tight">
            Cook Smart,
            <br /> Eat Healthy.
          </h1>
          <Search />

          <div className="flex flex-wrap gap-3 mt-4">
            {items.map((item) => (
              <div key={item}>
                <Tag metadata={item} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-[2]">
          <RecomendCard recipe={recipe?.data} />
        </div>
      </div>

      <div className="flex flex-row justify-between gap-6">
        <div className=" flex flex-col gap-4 w-full">
          <h2 className="text-2xl md:text-3xl font-medium">Browse Recipes</h2>
          <SliderCard />
        </div>
      </div>

      <div className="flex flex-row gap-5 mt-5">
        <div className="flex-[3] flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-medium ">Shopping List</h2>
            <div>
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
          <div className="grid grid-cols-4 gap-4 w-full">
            {shoppingList?.data.items.slice(0, 4).map((item) => (
              <div key={item._id}>
                <Ingredients {...item} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-[2]">
          <BadgesCard />
        </div>
      </div>

      <div className="bg-black p-15 text-white flex flex-row justify-between gap-4 -mx-11">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 items-center">
            <Link to="/dashboard" className="flex items-center ">
              <img
                src={logo}
                alt="logo"
                className={`rounded-xl object-cover h-10 w-10 `}
              />
            </Link>
            <h2 className="font-bold text-2xl text-[#0b7b2a] ">Cookly</h2>
          </div>
          <h5 className="text-5xl font-medium">Get the Cookly App Now!</h5>
          <p className="text-[#9c9c9c] font-medium">
            Cooking is at once child's play and adult joy.
          </p>
        </div>
        <img className="h-70 w-2xl -m-15 pr-15" src={download} alt="app image" />
      </div>

      {/* <div className="">
        <IndianCusiene/>
      </div> */}
      
      <div className="">
        <Cusiene/>
      </div>

      <div className="bg-[#eaeaea] p-5 -mx-11">
        <Footer/>
      </div>

    </div>
  );
};

export default Home;
