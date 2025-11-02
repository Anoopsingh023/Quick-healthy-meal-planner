import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import recipeImg from "../../assets/recipe.jpg";
import useRecipe from "../../hooks/useRecipe";
import { Tag, TimeTag, PriceTag, CalorieTag } from "../../shared/Tag";
import RecipeCard from "../../shared/RecipeCard";
import useShoppingList from "../../hooks/useShoppingList";
import Ingredients from "../../shared/Ingredients";
import Search from "../../shared/Search";
import { useEffect } from "react";
import SliderCard from "../../shared/SliderCard";

const PrevArrow = ({ className, style, onClick }) => (
  <button
    aria-label="Previous"
    className="absolute -left-8 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow cursor-pointer"
    style={{ ...style }}
    onClick={onClick}
  >
    <ChevronLeft size={18} />
  </button>
);

const NextArrow = ({ className, style, onClick }) => (
  <button
    aria-label="Next"
    className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow cursor-pointer"
    style={{ ...style }}
    onClick={onClick}
  >
    <ChevronRight size={18} />
  </button>
);

const Home = () => {
  const items = ["veg", "Egg", "Potato", "Tomato"];
  const { recipe, savedRecipes, getSavedRecipes, getRandomRecipe } =
    useRecipe();
  const { shoppingList, getShoppingList } = useShoppingList();

  const navigate = useNavigate();
  const handleRecipe = (recipeId) => {
    navigate(`/dashboard/${recipeId}`);
  };

  useEffect(() => {
    getSavedRecipes();
    getRandomRecipe();
    getShoppingList();
  }, []);

  const settings = {
    dots: true,
    infinite: savedRecipes?.data?.length > 3,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    centerPadding: "8px",
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1280, // below xl
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024, // below lg
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640, // below sm
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const cards = savedRecipes?.data || [];

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
                className="px-4 py-2 bg-[#b7b2b2] rounded-full text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className=" flex flex-col gap-4 w-2xl">
          <h2 className="text-2xl md:text-3xl font-medium">Browse Recipes</h2>
          <SliderCard cards={savedRecipes?.data || []} />
        </div>

        <div className="flex flex-col gap-4 w-md  ">
          <h2 className="text-2xl md:text-3xl font-medium ">Shopping List</h2>
          <div className="flex flex-col ">
            {shoppingList?.data.items.slice(0, 4).map((item) => (
              <div key={item._id} className="border px-4 py-1 m-0.5 rounded-sm">
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
          <RecipeCard recipe={recipe?.data} />
        </div>

        <div className="flex-[2]">
          <div className="border rounded-2xl p-4">
            <h3 className="text-2xl font-medium">Your Cooking Streaks</h3>
            <p className="mt-2 text-gray-700">4 Days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;