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
  generateAIRecipe,
  streamAIRecipes,
} from "../controllers/aiRecipe.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { dbSearchRecipes } from "../controllers/searchRecipe.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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
router.get("/search", searchRecipes);
router.get("/db-search", dbSearchRecipes);
router.get("/recommend",protect, getRecommendedRecipe);

// AiRecipe generator
router.post("/generate-ai", protect, generateAIRecipe);
router.get("/stream-ai", protect, streamAIRecipes);

export default router;
