import express from "express";
import {
  createRecipe,
  getUserRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  // searchRecipes,
  getRecommendedRecipe,
} from "../controllers/recipe.controller.js";
import {
  streamAIRecipes,
} from "../controllers/aiRecipe.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { dbSearchRecipes, searchRecipes } from "../controllers/searchRecipe.controller.js";

const router = express.Router();

// Manual recipe
// router.post("/", protect, createRecipe);
router.post(
  "/create",
  protect,
  upload.single("image"), // 👈 REQUIRED
  createRecipe
);

// Read
router.get("/", protect, getUserRecipes);
router.get("/re/:id", protect, getRecipeById);

// Update & Delete
router.patch("/re/update/:id", protect,upload.single("image"), updateRecipe);
router.delete("/re/delete/:id", protect, deleteRecipe);
// Add this before getAllRecipes
router.get("/search",protect, searchRecipes);
router.get("/db-search",protect, dbSearchRecipes);
router.get("/recommend",protect, getRecommendedRecipe);

// AiRecipe generator
router.get("/stream-ai", protect, streamAIRecipes);

export default router;
