import React from 'react'
import useRecipe from '../hooks/useRecipe';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { CalorieTag, TimeTag } from './Tag';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PrevArrow = ({ className, style, onClick }) => (
  <button
    aria-label="Previous"
    className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow cursor-pointer"
    style={{ ...style }}
    onClick={onClick}
  >
    <ChevronLeft size={18} />
  </button>
);

const NextArrow = ({ className, style, onClick }) => (
  <button
    aria-label="Next"
    className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white p-2 rounded-full shadow cursor-pointer"
    style={{ ...style }}
    onClick={onClick}
  >
    <ChevronRight size={18} />
  </button>
);

const SliderCard = ({ cards = [] }) => {
    const { recipe, savedRecipes,getSavedRecipes,getRandomRecipe } = useRecipe();
//    const { shoppingList } = useShoppingList();
   
  const navigate = useNavigate();
  const handleRecipe = (recipeId) => {
    navigate(`/dashboard/${recipeId}`);
  };


    const settings = {
    dots: true,
    infinite: savedRecipes?.data?.length > 3,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 0,
    centerPadding: "8px",
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1280, // below xl
        settings: {
          slidesToShow: 2,
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

  return (
    <div >
            {cards.length === 0 ? (
              <div className="rounded-2xl p-6 border ">
                <p className="text-gray-600">No saved recipes yet.</p>
              </div>
            ) : (
              <div className="relative">
                <Slider {...settings}>
                  {cards.map((savedRecipe) => (
                    <div
                      key={savedRecipe._id}
                      className="p-1 outline-none w-42"
                      aria-hidden={false}
                    >
                      <div className="flex flex-col gap-2 p-2 border rounded-2xl h-full">
                        <div className="h-30 w-full rounded-md overflow-hidden">
                          <img
                            className="w-full h-full object-cover cursor-pointer"
                            src={savedRecipe?.image || recipeImg}
                            alt={savedRecipe?.title || "Recipe"}
                            onClick={() => handleRecipe(savedRecipe._id)}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-md font-semibold line-clamp-1 hover:text-[#4b4b4b] cursor-pointer duration-300"
                            onClick={() => handleRecipe(savedRecipe._id)}
                          >
                            {savedRecipe?.title}
                          </h3>
                          <div className="mt-2 text-xs flex flex-wrap gap-1 items-center">
                            <TimeTag
                              metadata={savedRecipe?.metadata?.cookingTime}
                            />
                            <CalorieTag
                              metadata={savedRecipe?.metadata?.calories}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            )}
          </div>
  )
}

export default SliderCard