import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { Image } from "../../models/PostModels/imagePost.model.js";

export const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const posts = await Image.aggregate([
    { $sort: { createdAt: -1 } },

    // 👤 Owner
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$owner" },

    // ❤️ Likes count
    {
      $lookup: {
        from: "likes",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$target", "$$postId"] },
                  { $eq: ["$targetType", "Image"] },
                ],
              },
            },
          },
        ],
        as: "likes",
      },
    },

    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },

    // 🔥 Is liked by current user
    {
      $addFields: {
        isLiked: {
          $in: [userId, "$likes.likedBy"],
        },
      },
    },


    // 💬 Comments count
    {
      $lookup: {
        from: "comments",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$imagePost", "$$postId"] },
              parentComment: null,
              isDeleted: false,
            },
          },
          { $sort: { createdAt: -1 } },
          // { $limit: 2 },

          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },

          { $unwind: "$owner" },
        ],
        as: "comments",
      },
    },
    {
      $addFields: {
        commentsCount: { $size: "$comments" },
      },
    },
    {
      $project: {
        caption: 1,
        owner: 1,
        commentsCount: 1,
        imageFile: 1,
        isLiked: 1,
        isPublished: 1,
        likesCount: 1,
        createdAt:1,
        updatedAt:1,
        views:1
      },
    },
  ]);

  res
    .status(200)
    .json(new apiResponse(200, posts, "Feed fetched successfully"));
});
