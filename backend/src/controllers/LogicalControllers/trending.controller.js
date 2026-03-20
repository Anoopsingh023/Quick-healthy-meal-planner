import { Image } from "../models/image.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";

export const getTrendingImages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const aggregate = Image.aggregate([
    {
      $match: { isPublished: true }
    },

    // Add computed fields
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },

        // recency: newer posts get higher score
        hoursSinceCreated: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60
          ]
        }
      }
    },

    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ["$likesCount", 5] },
            { $multiply: ["$views", 1] },
            {
              $divide: [100, { $add: ["$hoursSinceCreated", 1] }]
            }
          ]
        }
      }
    },

    { $sort: { trendingScore: -1 } },

    // join user info
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner"
      }
    },
    { $unwind: "$owner" }
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  const result = await Image.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new apiResponse(200, result, "Trending feed fetched"));
});