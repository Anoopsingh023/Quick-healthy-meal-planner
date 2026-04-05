import { Recipe } from "../models/recipe.model.js";
import { getEmbedding } from "../utils/embedding.js";

export const dbSearch = async ({
  query,
  filter,
  page,
  limit,
}) => {
  let semanticResults = [];
  let textResults = [];

  // 🔥 SEMANTIC SEARCH
  if (query) {
    try {
      const queryVector = await getEmbedding(query);

      semanticResults = await Recipe.aggregate([
        {
          $vectorSearch: {
            index: "default",
            path: "embedding",
            queryVector,
            numCandidates: 100,
            limit: limit * 2,
          },
        },
        { $match: filter },
        {
          $addFields: {
            semanticScore: { $meta: "vectorSearchScore" },
          },
        },
      ]);
    } catch (err) {
      console.error("Semantic error:", err.message);
    }
  }

  // 🔥 TEXT SEARCH
  if (!semanticResults.length && query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    textResults = await Recipe.find({
      ...filter,
      $text: { $search: escaped },
    })
      .select({ score: { $meta: "textScore" } })
      .limit(limit)
      .lean();
  }

  // 🔥 MERGE + REMOVE DUPLICATES
  const map = new Map();

  [...semanticResults, ...textResults].forEach((r) => {
    map.set(r._id.toString(), r);
  });

  return Array.from(map.values());
};