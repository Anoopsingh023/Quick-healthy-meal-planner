import { Recipe } from "../models/recipe.model.js";
import { mapSpoonacularToRecipe } from "../utils/mapper.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import axios from "axios";

// Create Recipe (Manual)
const createRecipe = asyncHandler(async (req, res) => {
  const recipeData = req.body; // should match your schema
  const recipe = new Recipe({ ...recipeData, createdBy: req.user?._id });
  await recipe.save();

  res
    .status(201)
    .json(new apiResponse(200, recipe, "Recipe created successfully"));
});

// Get User Recipes
const getUserRecipes = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const recipes = await Recipe.find({ createdBy: userId }).populate(
    "createdBy",
    "userName email"
  );

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        { count: recipes.length, data: recipes },
        "recipe fetched successfully"
      )
    );
});

// Get Single Recipe
const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate(
    "createdBy",
    "userName email"
  );

  if (!recipe) {
    throw new apiError(404, "Recipe not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, recipe, "Recipe fetched successfully"));
});

// Update Recipe
const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new apiError(404, "Recipe not found");
  }

  // Permission check: only creator can update
  if (recipe.createdBy.toString() !== req.user._id.toString()) {
    throw new apiError(403, "not authorized to update this recipe");
  }

  // Perform update
  Object.assign(recipe, req.body);
  await recipe.save();

  res
    .status(200)
    .json(new apiResponse(200, recipe, "Recipe updated successfully"));
});

// Delete Recipe
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new apiError(404, "Recipe not found");
  }

  // Permission check
  if (recipe.createdBy.toString() !== req.user._id.toString()) {
    throw new apiError(403, "not authorized to delete this recipe");
  }

  await recipe.deleteOne();

  res.status(200).json(new apiResponse(200, {}, "Recipe deleted successfully"));
});

// Search / Filter Recipes
const searchRecipes = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new apiError(400, "Query parameter is required");
  }

  // 1. Check database first
  let recipes = await Recipe.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ],
  });

  if (recipes.length > 0) {
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { count: recipes.length, data: recipes },
          "Recipe fetched successfully"
        )
      );
  }

  // 2. Fetch from Spoonacular (complexSearch for IDs)
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=3&apiKey=${apiKey}`;
  const { data } = await axios.get(searchUrl);

  if (!data.results || data.results.length === 0) {
    throw new apiError(404, "No recipes found in DB or Spoonacular");
  }

  // 3. Fetch full recipe info for each result
  const detailedRecipes = [];
  for (const recipe of data.results) {
    const detailUrl = `https://api.spoonacular.com/recipes/${recipe.id}/information?includeNutrition=true&apiKey=${apiKey}`;
    const { data: detailData } = await axios.get(detailUrl);

    const mapped = mapSpoonacularToRecipe(detailData);

    // Check if already saved
    let existing = await Recipe.findOne({ spoonacularId: detailData.id });
    if (!existing) {
      const newRecipe = new Recipe({
        ...mapped,
        spoonacularId: detailData.id,
        source: "Spoonacular",
      });
      await newRecipe.save();
      detailedRecipes.push(newRecipe);
    } else {
      detailedRecipes.push(existing);
    }
  }

  // 4. Return results
  res
    .status(200)
    .json(
      new apiResponse(
        200,
        {
          source: "spoonacular",
          count: detailedRecipes.length,
          data: detailedRecipes,
        },
        "Recipe fetched successfully"
      )
    );
});

export {
  createRecipe,
  getUserRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
};
