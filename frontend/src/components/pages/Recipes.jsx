// pages/Recipes.jsx
import React, { useState } from "react";

const allRecipes = [
  {
    id: 1,
    title: "Quick Veg Rice Bowl",
    cuisine: "Indian",
    dietType: "Veg",
    cost: 100,
    cookingTime: 10,
    difficulty: "Easy",
    image: "/recipes/rice-bowl.jpg",
  },
  {
    id: 2,
    title: "Vegan Salad",
    cuisine: "Italian",
    dietType: "Vegan",
    cost: 80,
    cookingTime: 5,
    difficulty: "Easy",
    image: "/recipes/vegan-salad.jpg",
  },
  {
    id: 3,
    title: "Chicken Curry",
    cuisine: "Indian",
    dietType: "Non-Veg",
    cost: 150,
    cookingTime: 30,
    difficulty: "Medium",
    image: "/recipes/chicken-curry.jpg",
  },
];

const Recipes = () => {
  const [filters, setFilters] = useState({ diet: "Any", cuisine: "All" });

  const filteredRecipes = allRecipes.filter((recipe) => {
    return (
      (filters.diet === "Any" || recipe.dietType === filters.diet) &&
      (filters.cuisine === "All" || recipe.cuisine === filters.cuisine)
    );
  });

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <div className="flex space-x-4 items-center mb-4">
        <select
          className="px-3 py-2 border rounded"
          value={filters.diet}
          onChange={(e) => setFilters({ ...filters, diet: e.target.value })}
        >
          <option value="Any">All Diets</option>
          <option value="Veg">Veg</option>
          <option value="Vegan">Vegan</option>
          <option value="Non-Veg">Non-Veg</option>
          <option value="Keto">Keto</option>
        </select>

        <select
          className="px-3 py-2 border rounded"
          value={filters.cuisine}
          onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
        >
          <option value="All">All Cuisines</option>
          <option value="Indian">Indian</option>
          <option value="Italian">Italian</option>
          <option value="Chinese">Chinese</option>
        </select>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg cursor-pointer transition"
          >
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <h3 className="font-semibold">{recipe.title}</h3>
            <p className="text-sm text-gray-600">{recipe.cuisine}</p>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>{recipe.cookingTime} min</span>
              <span>{recipe.difficulty}</span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{recipe.dietType}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
