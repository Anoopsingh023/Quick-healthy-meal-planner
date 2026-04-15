import axios from "axios";
import React, { useState } from "react";
import { base_url } from "../utils/constant";
import { useNavigate } from "react-router-dom";

const Cuisine = () => {
  const navigate = useNavigate();
  const cuisines = [
    { id: 1, name: "Indian", tag: ["indian"] },
    { id: 2, name: "Italian", tag: ["italian"] },
    { id: 3, name: "Chinese", tag: ["chinese"] },
    { id: 4, name: "Mexican", tag: ["mexican"] },
    { id: 5, name: "Thai", tag: ["thai"] },
    { id: 6, name: "Japanese", tag: ["japanese"] },
    { id: 7, name: "French", tag: ["french"] },
    { id: 8, name: "Spanish", tag: ["spanish"] },
    { id: 9, name: "Greek", tag: ["greek"] },
    { id: 10, name: "Turkish", tag: ["turkish"] },
    { id: 11, name: "Lebanese", tag: ["lebanese", "middle eastern"] },
    { id: 12, name: "American", tag: ["american", "usa"] },
    { id: 13, name: "Korean", tag: ["korean"] },
    { id: 14, name: "Vietnamese", tag: ["vietnamese"] },
    { id: 15, name: "Indonesian", tag: ["indonesian"] },
    { id: 16, name: "Malaysian", tag: ["malaysian"] },
    { id: 17, name: "Afghani", tag: ["afghani", "afghan"] },
    { id: 18, name: "Pakistani", tag: ["pakistani"] },
    { id: 19, name: "Nepalese", tag: ["nepalese"] },
    { id: 20, name: "Sri Lankan", tag: ["sri lankan"] },
    { id: 21, name: "Middle Eastern", tag: ["middle eastern", "arab"] },
    { id: 22, name: "Mediterranean", tag: ["mediterranean"] },
    { id: 23, name: "Brazilian", tag: ["brazilian"] },
    { id: 24, name: "Peruvian", tag: ["peruvian"] },
    { id: 25, name: "German", tag: ["german"] },
    { id: 26, name: "British", tag: ["british", "uk"] },
    { id: 27, name: "Russian", tag: ["russian"] },
    { id: 28, name: "African", tag: ["african"] },
  ];

  const ITEMS_PER_ROW = 4;
  const ROWS_TO_SHOW = 3;
  const INITIAL_COUNT = ITEMS_PER_ROW * ROWS_TO_SHOW;

  const [showAll, setShowAll] = useState(false);

  const visibleCuisines = showAll ? cuisines : cuisines.slice(0, INITIAL_COUNT);

  const getRecipeFromDb = async (tagsArray) => {
    try {
      const tag = tagsArray.join(",");
      const params = { query: tag };

      const queryString = new URLSearchParams(params).toString();
      navigate(`/dashboard/db-search?${queryString}`);
    } catch (error) {
      console.error("Error fetching recipes by dish:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl md:text-3xl font-medium mb-4 ">
        International Flavors
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {visibleCuisines.map((cuisine, index) => (
          <div
            key={index}
            onClick={() => getRecipeFromDb(cuisine.tag)}
            className="p-4 text-[#212121] font-semibold border border-[#7f7d7d] rounded-xl hover:shadow-md cursor-pointer transition"
          >
            <h2 className="text-center text-sm font-medium">
              {cuisine.name} Recipes
            </h2>
          </div>
        ))}
      </div>

      {/* Show Button */}
      {cuisines.length > INITIAL_COUNT && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 rounded-full bg-green-600 text-white text-sm hover:bg-green-700 transition cursor-pointer"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Cuisine;
