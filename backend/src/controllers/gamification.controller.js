import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { recordCook } from "../utils/gamification.js";
import { Recipe } from "../models/recipe.model.js"; 
import { User } from "../models/user.model.js";

const markRecipeCooked = asyncHandler(async(req, res) => {
  const { recipeId } = req.params;
  const userId = req.user._id;

  // optional: validate recipe exists
  const recipe = await Recipe.findById(recipeId).select("estimatedCost metadata");
  if (!recipe) throw new apiError(404, "Recipe not found");

  // userBudget could be read from user.preferences.budgetRange.max or sent in body
  const userBudget = req.user?.preferences?.budgetRange?.max;

  const result = await recordCook(userId, {
    recipeId,
    recipeCost: recipe.estimatedCost ?? null,
    userBudget,
    recipeMetadata: recipe.metadata ?? {},
  });

  return res.status(200).json(new apiResponse(200, result, "Recipe recorded as cooked"));
});

const getGamification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("gamification");
  if (!user) throw new apiError(404, "User not found");
  res.status(200).json(new apiResponse(200, user.gamification, "Gamification fetched"));
});

const getLeaderboard = asyncHandler(async (req, res) => {
  const topN = parseInt(req.query.limit) || 10;
  const users = await User.find()
    .select("fullName userName gamification.cookedCount gamification.points avatar")
    .sort({ "gamification.cookedCount": -1 })
    .limit(topN);
  res.status(200).json(new apiResponse(200, users, "Leaderboard fetched"));
});

export {markRecipeCooked,
    getGamification,
    getLeaderboard
}