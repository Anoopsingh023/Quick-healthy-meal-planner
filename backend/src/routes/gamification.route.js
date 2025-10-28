import express from "express";
import {
  getGamification,
  getLeaderboard,
  markRecipeCooked,
} from "../controllers/gamification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/me/cook/:recipeId", protect, markRecipeCooked);
router.get("/me/gamification", protect, getGamification);
router.get("/leaderboard", protect, getLeaderboard);

export default router;
