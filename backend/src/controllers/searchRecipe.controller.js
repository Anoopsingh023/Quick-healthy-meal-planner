import { asyncHandler } from "../utils/asyncHandler.js";
import { dbSearch } from "../services/dbSearch.service.js";
import { spoonacularSearch } from "../services/spoonacular.service.js";
import { rankRecipes } from "../services/ranking.service.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { redisClient } from "../config/redisClient.js";
import { filterdata } from "../services/filterdata.service.js";

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
    userId: req.user?._id,
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
    userId: req.user?._id,
  });

  // =========================================================
  // 3️⃣ MERGE + RANK
  // =========================================================
  const finalResults = rankRecipes([...dbResults, ...spoonResults]);

  res.json({
    success: true,
    source: "hybrid",
    count: finalResults.length,
    data: finalResults.slice(0, pageSize),
  });
});

const dbSearchRecipes = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 12 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, parseInt(limit));

  // 🔥 1️⃣ GLOBAL CACHE KEY (NO USER DATA)
  const cacheKey = `search:${query}:page:${pageNum}:limit:${pageSize}`;

  let cached = null;

  try {
    cached = await redisClient.get(cacheKey);
  } catch (err) {
    console.log("Redis failed, fallback to DB");
  }

  let baseResults;

  if (cached) {
    console.log("⚡ Global Cache hit");
    const redisResults = JSON.parse(cached);

    if (redisResults.length < limit) {
      // Cache has fewer results than needed — top up from DB
      const required = await dbSearch({
        query,
        filter: {},
        page: pageNum,
        limit: limit - redisResults.length, // only fetch what's missing
      });
      baseResults = [...redisResults, ...required];
    }else {
    // Cache has enough — use it directly
    baseResults = redisResults;
  }

  } else {
    console.log("💾 Cache miss → DB call");

    // ❗ IMPORTANT: NO user filter here
    baseResults = await dbSearch({
      query,
      filter: {}, // 🔥 REMOVE USER FILTER
      page: pageNum,
      limit: pageSize,
    });

    // Only cache if we got results worth caching
    if (baseResults.length > 0) {
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(baseResults));
  }
  }

  // 🔥 2️⃣ APPLY USER PERSONALIZATION (NO CACHE)

  const user = await User.findById(req.user._id).lean();
  if (!user) {
    return res.status(404).json(new apiResponse(404, "User not found"));
  }

  const filteredResults = await filterdata({ baseResults, user });

  // 🔥 3️⃣ FINAL RESPONSE
  filteredResults.slice(0, pageSize);
  const finalResults = rankRecipes(filteredResults);

  res.json({
    success: true,
    source: cached ? "redis+personalized" : "database+personalized",
    meta: {
      page: pageNum,
      limit: pageSize,
      hasMore: finalResults.length === pageSize,
    },
    count: finalResults.length,
    data: finalResults,
  });
});

export { searchRecipes, dbSearchRecipes };
