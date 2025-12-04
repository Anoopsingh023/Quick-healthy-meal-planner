import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Like } from "../models/like.model.js";
import { Recipe } from "../models/recipe.model.js";
// import { User } from "../models/user.model";

const toggleRecipeLike = asyncHandler(async (req, res) => {
  const { recipeId } = req.params.recipeId;
  const likedById = req.user._id;

  const recipe = await Recipe.findById(req.params.recipeId);
  if (!recipe) {
    throw new apiError(400, "Recipe is not available");
  }

  const alreadyLiked = await Like.findOne({
    recipe: recipeId,
    likedBy: likedById,
  });

  if (!alreadyLiked) {
    const likeRecipe = await Like.create({
      recipe: recipeId,
      likedBy: likedById,
    });

    return res
      .status(200)
      .json(new apiResponse(200, likeRecipe, "Recipe is liked"));
  }

  const unlikeRecipe = await Like.deleteOne({ _id: alreadyLiked._id });

  return res.status(200).json(new apiResponse(200, null, "Recipe is unliked"));
});

export { toggleRecipeLike };
