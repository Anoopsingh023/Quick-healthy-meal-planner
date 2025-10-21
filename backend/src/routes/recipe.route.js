import express from "express";
import {
  createRecipe,
  getUserRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  getRecommendedRecipe,
} from "../controllers/recipe.controller.js";
import {
  generateRecipePreviews,
  getOrGenerateRecipeDetails,
} from "../controllers/aiRecipe.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Manual recipe
router.post("/", protect, createRecipe);

// Read
router.get("/", protect, getUserRecipes);
router.get("/re/:id", protect, getRecipeById);

// Update & Delete
router.put("/re/update/:id", protect, updateRecipe);
router.delete("/re/delete/:id", protect, deleteRecipe);
// Add this before getAllRecipes
router.get("/search", protect, searchRecipes);
router.get("/recommend",protect, getRecommendedRecipe);

// AiRecipe generator
router.post("/generate-previews", protect, generateRecipePreviews); // body: { ingredients: [...], count: 3 }
router.post("/:id/details", protect, getOrGenerateRecipeDetails);   // body optional: { ingredientsAvailable: [...] }

export default router;
