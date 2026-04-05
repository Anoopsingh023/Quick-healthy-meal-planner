import { asyncHandler } from "../utils/asyncHandler.js";
import { dbSearch } from "../services/dbSearch.service.js";
import { spoonacularSearch } from "../services/spoonacular.service.js";
import { rankRecipes } from "../services/ranking.service.js";

const searchRecipes = asyncHandler(async (req, res) => {
  const {
    query,
    cuisine,
    dietType,
    difficulty,
    costMin,
    costMax,
    page = 1,
    limit = 12,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, parseInt(limit));

  // ---------------- FILTER ----------------
  const filter = {};

  if (dietType) filter["metadata.dietType"] = dietType;

  if (difficulty) {
    filter["metadata.difficulty"] = {
      $in: difficulty.split(",").map((d) => d.trim()),
    };
  }

  if (cuisine) {
    const cuisines = cuisine.split(",").map((c) => c.toLowerCase().trim());

    filter.$or = [
      { "metadata.cuisine": { $in: cuisines } },
      { tags: { $in: cuisines } },
    ];
  }

  if (costMin || costMax) {
    filter["metadata.costEstimate"] = {};
    if (costMin) filter["metadata.costEstimate"].$gte = Number(costMin);
    if (costMax) filter["metadata.costEstimate"].$lte = Number(costMax);
  }

  filter.$and = [
    { "ingredients.0": { $exists: true } },
    { "steps.0": { $exists: true } },
  ];

  // =========================================================
  // 1️⃣ DATABASE SEARCH
  // =========================================================
  const dbResults = await dbSearch({
    query,
    filter,
    page: pageNum,
    limit: pageSize,
  });

  if (dbResults.length >= pageSize) {
    return res.json({
      success: true,
      source: "database",
      data: rankRecipes(dbResults).slice(0, pageSize),
    });
  }

  // =========================================================
  // 2️⃣ SPOONACULAR
  // =========================================================
  const needed = pageSize - dbResults.length;

  const spoonResults = await spoonacularSearch({
    query,
    cuisine,
    limit: needed,
  });

  // =========================================================
  // 3️⃣ MERGE + RANK
  // =========================================================
  const finalResults = rankRecipes([
    ...dbResults,
    ...spoonResults,
  ]);

  res.json({
    success: true,
    source: "hybrid",
    count: finalResults.length,
    data: finalResults.slice(0, pageSize),
  });
});

export { searchRecipes };