import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { Comment } from "../../models/PostModels/comment.model.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
  const { content, imagePost, parentComment } = req.body;
  const userId = req.user._id;

  if (!content || !imagePost) {
    throw new apiError(400, "Content and postId are required");
  }

  const comment = await Comment.create({
    owner: userId,
    content,
    imagePost,
    parentComment: parentComment || null,
  });

  // 🔥 Increment replies count if it's a reply
  if (parentComment) {
    await Comment.findByIdAndUpdate(parentComment, {
      $inc: { repliesCount: 1 },
    });
  }

  res
    .status(201)
    .json(new apiResponse(201, comment, "Comment created successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new apiError(404, "Comment not found");

  if (comment.owner.toString() !== userId.toString()) {
    throw new apiError(403, "Not authorized");
  }

  // Soft delete
  comment.isDeleted = true;
  //   comment.content = "";
  await comment.save();

  res
    .status(200)
    .json(new apiResponse(200, {}, "Comment deleted successfully"));
});

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const aggregate = Comment.aggregate([
    {
      $match: {
        imagePost: new mongoose.Types.ObjectId(postId),
        parentComment: null,
      },
    },

    { $sort: { createdAt: -1 } },

    // ✅ Owner lookup (correct way with pipeline)
    {
      $lookup: {
        from: "users",
        let: { ownerId: "$owner" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$ownerId"] },
            },
          },
          {
            $project: {
              fullName: 1,
              avatar: 1,
              userName: 1,
            },
          },
        ],
        as: "owner",
      },
    },
    { $unwind: "$owner" },

    // 🔥 Replies
    {
      $lookup: {
        from: "comments",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$parentComment", "$$commentId"] },
            },
          },
          { $sort: { createdAt: 1 } },
          { $limit: 2 },

          {
            $lookup: {
              from: "users",
              let: { ownerId: "$owner" },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ["$_id", "$$ownerId"] },
                  },
                },
                {
                  $project: {
                    fullName: 1,
                    avatar: 1,
                    userName: 1,
                  },
                },
              ],
              as: "owner",
            },
          },
          { $unwind: "$owner" },

          // ✅ Handle deleted replies
          {
            $addFields: {
              content: {
                $cond: [
                  { $eq: ["$isDeleted", true] },
                  "This comment was deleted",
                  "$content",
                ],
              },
            },
          },
        ],
        as: "replies",
      },
    },

    // ✅ Handle deleted comments
    {
      $addFields: {
        content: {
          $cond: [
            { $eq: ["$isDeleted", true] },
            "This comment was deleted",
            "$content",
          ],
        },
      },
    },

    // ❤️ Likes count
    // {
    //   $lookup: {
    //     from: "likes",
    //     let: { commentId: "$_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               { $eq: ["$target", "$$commentId"] },
    //               { $eq: ["$targetType", "Comment"] },
    //               { $eq: ["$likedBy", new mongoose.Types.ObjectId(userId)] },
    //             ],
    //           },
    //         },
    //       },
    //     ],
    //     as: "likes",
    //   },
    // },

    // {
    //   $addFields: {
    //     likesCount: { $size: "$likes" },
    //     isLiked: { $gt: [{ $size: "$likes" }, 0] },
    //   },
    // },

    // 🔥 Check if current user liked
    // {
    //   $lookup: {
    //     from: "likes",
    //     let: { commentId: "$_id" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               { $eq: ["$target", "$$commentId"] },
    //               { $eq: ["$targetType", "Comment"] },
    //               { $eq: ["$likedBy", new mongoose.Types.ObjectId(userId)] },
    //             ],
    //           },
    //         },
    //       },
    //     ],
    //     as: "likedByUser",
    //   },
    // },

    // {
    //   $addFields: {
    //     isLiked: { $gt: [{ $size: "$likedByUser" }, 0] },
    //   },
    // },
    // ❤️ Get ALL likes (for count)
    {
      $lookup: {
        from: "likes",
        let: { commentId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$target", "$$commentId"] },
                  { $eq: ["$targetType", "Comment"] },
                ],
              },
            },
          },
        ],
        as: "likes",
      },
    },

    // 🔥 Compute likesCount + isLiked in ONE step
    {
      $addFields: {
        likesCount: { $size: "$likes" },

        isLiked: {
          $in: [new mongoose.Types.ObjectId(userId), "$likes.likedBy"],
        },
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Comment.aggregatePaginate(aggregate, options);

  res
    .status(200)
    .json(new apiResponse(200, result, "Comments fetched successfully"));
});

const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new apiError(400, "Invalid commentId");
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        parentComment: new mongoose.Types.ObjectId(commentId),
      },
    },

    { $sort: { createdAt: 1 } },

    // 👤 Owner details
    {
      $lookup: {
        from: "users",
        let: { ownerId: "$owner" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$ownerId"] },
            },
          },
          {
            $project: {
              fullName: 1,
              avatar: 1,
              userName: 1,
            },
          },
        ],
        as: "owner",
      },
    },
    { $unwind: "$owner" },

    // 🧠 Handle deleted replies
    {
      $addFields: {
        content: {
          $cond: [
            { $eq: ["$isDeleted", true] },
            "This comment was deleted",
            "$content",
          ],
        },
      },
    },

    // 🔥 Clean response
    {
      $project: {
        content: 1,
        owner: 1,
        likesCount: 1,
        repliesCount: 1,
        createdAt: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Comment.aggregatePaginate(aggregate, options);

  res
    .status(200)
    .json(new apiResponse(200, result, "Replies fetched successfully"));
});

export { createComment, deleteComment, getComments, getReplies };
