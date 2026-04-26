import { Recipe } from "../models/recipe.model.js";
import { autoCorrectQuery } from "../utils/autocorrect.js";
import { getEmbedding } from "../utils/embedding.js";
import { Like } from "../models/PostModels/like.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const enhanceQuery = (query) => {
  return `
  Recipe search for: ${query}
  Consider ingredients, cuisine, cost, and diet preference
  `;
};

export const dbSearch = async ({ query, filter, page, limit, userId }) => {
  let semanticResults = [];
  let textResults = [];
  const cuisineArray = Array.isArray(filter?.["metadata.cuisine"]?.$in)
    ? filter["metadata.cuisine"].$in
    : [];

  // 🔥 SEMANTIC SEARCH
  if (query) {
    try {
      const cleanQuery = query.toLowerCase().trim();
      const correctedQuery = autoCorrectQuery(cleanQuery);
      const queryVector = await getEmbedding(enhanceQuery(correctedQuery));

      semanticResults = await Recipe.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector,
            numCandidates: 50,
            limit: limit * 2,
          },
        },
        { $match: filter },
        {
          $addFields: {
            semanticScore: { $meta: "vectorSearchScore" },
            popularityScore: {
              $add: [
                { $multiply: ["$stats.views", 0.2] },
                { $multiply: ["$stats.likes", 0.4] },
                { $multiply: ["$stats.saves", 0.4] },
              ],
            },

            freshnessScore: {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },

            ratingScore: "$stats.rating",

            costScore: {
              $cond: [{ $lte: ["$metadata.costEstimate", 200] }, 1, 0.5],
            },
            exactMatchBoost: {
              $cond: [
                {
                  $regexMatch: { input: "$title", regex: query, options: "i" },
                },
                0.3,
                0,
              ],
            },
            cuisineBoost: {
              $cond: [{ $in: ["$metadata.cuisine", cuisineArray] }, 0.2, 0],
            },
          },
        },
        {
          $addFields: {
            finalScore: {
              $add: [
                { $multiply: ["$semanticScore", 0.6] },
                { $multiply: ["$popularityScore", 0.15] },
                { $multiply: ["$ratingScore", 0.1] },
                { $multiply: ["$costScore", 0.05] },
                "$exactMatchBoost",
                "$cuisineBoost",

                // 🔥 freshness boost (inverse days)
                {
                  $multiply: [
                    { $divide: [1, { $add: ["$freshnessScore", 1] }] },
                    0.05,
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            title: 1,
            image: 1,
            isVerified: 1,
            "metadata.cookingTime": 1,
            "metadata.difficulty": 1,
            "metadata.cuisine": 1,
            "metadata.dietType": 1,
            "metadata.calories": 1,
            "metadata.costEstimate": 1,

            "stats.likes": 1,
            "stats.saves": 1,
            "stats.rating": 1,
            popularityScore: 1,
            qualityScore: 1,
            finalScore: 1,
          },
        },
        { $sort: { finalScore: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);
    } catch (err) {
      console.error("Semantic error:", err.message);
    }
  }

  // 🔥 TEXT SEARCH
  if (semanticResults.length < limit && query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    textResults = await Recipe.find({
      ...filter,
      $text: { $search: escaped },
    })
      .select({
        title: 1,
        image: 1,
        isVerified: 1,
        "metadata.cuisine": 1,
        "metadata.dietType": 1,
        "metadata.cookingTime": 1,
        "metadata.costEstimate": 1,
        "metadata.calories": 1,
        "stats.likes": 1,
        "stats.saves": 1,
        "stats.rating": 1,
        popularityScore: 1,
        qualityScore: 1,
      })
      .limit(limit)
      .sort({ score: { $meta: "textScore" } })
      .lean();
  }

  // 🔥 MERGE + REMOVE DUPLICATES
  const map = new Map();

  [...semanticResults, ...textResults].forEach((r) => {
    map.set(r._id.toString(), r);
  });

  // ---------------- 🔥 FINAL ENRICHMENT ----------------
  const finalResults = Array.from(map.values())
    .map((recipe) => ({
      ...recipe,
    }))
    .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
    .slice(0, limit);

  return finalResults;
};
