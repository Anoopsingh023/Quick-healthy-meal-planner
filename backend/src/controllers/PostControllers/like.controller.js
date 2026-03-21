import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { Like } from "../../models/PostModels/like.model.js";
import { Comment } from "../../models/PostModels/comment.model.js";
import {Image} from "../../models/PostModels/imagePost.model.js"
import { Recipe } from "../../models/recipe.model.js";


const updateLikeCount = async (targetId, targetType, value) => {
  const ModelMap = {
    Comment,
    Image,
    Recipe
  };

  const Model = ModelMap[targetType];

  if (Model) {
    await Model.findByIdAndUpdate(targetId, {
      $inc: { likesCount: value }
    });
  }
};


const toggleLike = asyncHandler(async (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.user._id;

  if (!targetId || !targetType) {
    throw new apiError(400, "targetId and targetType required");
  }

  const existingLike = await Like.findOne({
    target: targetId,
    targetType,
    likedBy: userId
  });

  let isLiked;

  if (existingLike) {
    // ❌ Unlike
    await Like.deleteOne({ _id: existingLike._id });

    isLiked = false;

    // decrement count
    await updateLikeCount(targetId, targetType, -1);
  } else {
    // ❤️ Like
    await Like.create({
      target: targetId,
      targetType,
      likedBy: userId
    });

    isLiked = true;

    // increment count
    await updateLikeCount(targetId, targetType, 1);
  }

  res.status(200).json(
    new apiResponse(200, { isLiked }, "Like toggled successfully")
  );
});



export { toggleLike };
