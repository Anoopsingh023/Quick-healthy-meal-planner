import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";
import biryani from "../assets/recipe/biryani.jpg";
import cake from "../assets/recipe/cake.jpg";
import dosa from "../assets/recipe/dosa.jpg";
import indian from "../assets/recipe/indian.jpg";
import noodle from "../assets/recipe/noodle.jpg";
import paneer from "../assets/recipe/paneer.jpg";
import pizza from "../assets/recipe/pizza.jpg";
import nonVeg from "../assets/recipe/nonVeg.jpg";

const PrevArrow = ({ onClick }) => (
  <button
    aria-label="Previous slide"
    onClick={onClick}
    className="absolute left-2 top-1/2 cursor-pointer -translate-y-1/2 z-20 bg-white/95 hover:bg-white p-2 rounded-full shadow focus:outline-none"
  >
    <ChevronLeft size={18} />
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    aria-label="Next slide"
    onClick={onClick}
    className="absolute right-2 cursor-pointer top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white p-2 rounded-full shadow focus:outline-none"
  >
    <ChevronRight size={18} />
  </button>
);

const SliderCard = ({ cards = [] }) => {
  const navigate = useNavigate();

  const dishes = [
    // { id: 1, img: indian, name: "Indian",tag: ["indian"] },
    { id: 4, img: paneer, name: "Paneer" ,tag:[ "paneer"]},
    { id: 8, img: nonVeg, name: "Non Veg" ,tag: ["chicken", "mutton", "fish"]},
    { id: 5, img: cake, name: "Cake", tag:["cake", "bakery"] },
    { id: 2, img: noodle, name: "Noodle", tag: ["noodle","maggie"] },
    { id: 7, img: pizza, name: "Pizza", tag: ["pizza"] },
    { id: 6, img: biryani, name: "Biryani", tag: ["biryani", "haidrabadi biryani"] },
    // { id: 3, img: dosa, name: "Dosa",tag: ["dosa", "masala dosa"] },
  ];

  const getRecipeFromDb = async (tagsArray) => {
    try {
      const tag = tagsArray.join(",");
      const params = {query:tag}

      const queryString = new URLSearchParams(params).toString();
      navigate(`/dashboard/db-search?${queryString}`);

    } catch (error) {
      console.error("Error fetching recipes by dish:", error);
    }
  };

  // compute whether to enable infinite depending on number of cards
  const slidesToShowDesktop = 5;
  const slidesToShowTablet = 2;
  const slidesToShowMobile = 1;

  const settings = {
    dots: false,
    infinite: dishes.length > slidesToShowDesktop,
    speed: 450,
    slidesToShow: Math.min(slidesToShowDesktop, dishes.length || slidesToShowDesktop),
    slidesToScroll: 1,
    initialSlide: 0,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(slidesToShowTablet, dishes.length || slidesToShowTablet),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(slidesToShowTablet, dishes.length || slidesToShowTablet),
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: Math.min(slidesToShowMobile, dishes.length || slidesToShowMobile),
        },
      },
    ],
    appendDots: (dots) => (
      <div className="mt-4">
        <ul className="flex gap-2 justify-center">{dots}</ul>
      </div>
    ),
    customPaging: () => <button className="w-2 h-2 rounded-full bg-gray-300" />,
    accessibility: true,
    adaptiveHeight: false,
  };

  return (
        <div className="relative">
          <Slider {...settings}>
            {dishes.map((dish) => (
              <div key={dish.id} className="p-2">
                <div className="relative flex flex-col gap-3 bg-[#08324a] rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="w-full overflow-hidden">
                    <div className="relative w-full h-44 sm:h-48 md:h-60 lg:h-52 rounded-b-none rounded-2xl overflow-hidden">
                      <img
                        onClick={() => getRecipeFromDb(dish.tag)}
                        className="w-full h-full object-cover transform transition-transform duration-500 ease-out hover:scale-105 cursor-pointer"
                        src={dish.img}
                        alt={dish.name ?? "Recipe image"}
                      />

                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100"
                      />
                    </div>
                  </div>

                  <div className="px-2 pb-4">
                    <h3
                      className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-200 line-clamp-1"
                      title={dish.name}
                      onClick={() => getRecipeFromDb(dish.tag)}
                    >
                      {dish.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
  );
};

export default SliderCard;
