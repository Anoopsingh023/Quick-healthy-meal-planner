import axios from "axios";
import React, { useState } from "react";
import { base_url } from "../utils/constant";
import { useNavigate } from "react-router-dom";

const Cuisine = () => {
  const navigate = useNavigate();
  const indianStates = [
    { id: 1, name: "Andhra Pradesh", tag: ["andhra pradesh", "andhra"] },
    { id: 2, name: "Arunachal Pradesh", tag: ["arunachal pradesh"] },
    { id: 3, name: "Assam", tag: ["assam"] },
    { id: 4, name: "Bihar", tag: ["bihar"] },
    { id: 5, name: "Chhattisgarh", tag: ["chhattisgarh"] },
    { id: 6, name: "Goa", tag: ["goa"] },
    { id: 7, name: "Gujarat", tag: ["gujarat"] },
    { id: 8, name: "Haryana", tag: ["haryana"] },
    { id: 9, name: "Himachal Pradesh", tag: ["himachal pradesh"] },
    { id: 10, name: "Jharkhand", tag: ["jharkhand"] },
    { id: 11, name: "Karnataka", tag: ["karnataka"] },
    { id: 12, name: "Kerala", tag: ["kerala"] },
    { id: 13, name: "Madhya Pradesh", tag: ["madhya pradesh", "mp"] },
    { id: 14, name: "Maharashtra", tag: ["maharashtra"] },
    { id: 15, name: "Manipur", tag: ["manipur"] },
    { id: 16, name: "Meghalaya", tag: ["meghalaya"] },
    { id: 17, name: "Mizoram", tag: ["mizoram"] },
    { id: 18, name: "Nagaland", tag: ["nagaland"] },
    { id: 19, name: "Odisha", tag: ["odisha", "orissa"] },
    { id: 20, name: "Punjab", tag: ["punjab"] },
    { id: 21, name: "Rajasthan", tag: ["rajasthan"] },
    { id: 22, name: "Sikkim", tag: ["sikkim"] },
    { id: 23, name: "Tamil Nadu", tag: ["tamil nadu", "tamil"] },
    { id: 24, name: "Telangana", tag: ["telangana"] },
    { id: 25, name: "Tripura", tag: ["tripura"] },
    { id: 26, name: "Uttar Pradesh", tag: ["uttar pradesh", "up"] },
    { id: 27, name: "Uttarakhand", tag: ["uttarakhand", "uk"] },
    { id: 28, name: "West Bengal", tag: ["west bengal"] },
  ];

  const ITEMS_PER_ROW = 4;
  const ROWS_TO_SHOW = 3;
  const INITIAL_COUNT = ITEMS_PER_ROW * ROWS_TO_SHOW;

  const [showAll, setShowAll] = useState(false);

  const getRecipeFromDb = async (tagsArray) => {
    try {
      const tag = tagsArray.join(",");
      const params = { cuisine: tag };
      const res = await axios.get(`${base_url}/recipes/db-search`, {
        params,
        withCredentials: true,
      });
      const queryString = new URLSearchParams(params).toString();
      navigate(`/dashboard/db-search?${queryString}`);

      console.log("recipes from DB for", tag, res.data);
    } catch (error) {
      console.error("Error fetching recipes by dish:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl md:text-3xl font-medium mb-4 ">Indian Flavors</h1>

      <div className="flex flex-row gap-5 justify-center">
        <h2 className="text-xl md:text-2xl font-medium mb-4 ">Select State</h2>
        <select className="px-5 py-2 border rounded-md" name="" id="">
          {indianStates.map((state) => (
            <option 
            key={state.id} 
            value={state.name}
            className="p-4"
            >
              {state.name}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default Cuisine;
