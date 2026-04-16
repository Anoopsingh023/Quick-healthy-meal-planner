import { asyncHandler } from "../utils/asyncHandler.js";
import { dbSearch } from "../services/dbSearch.service.js";
import { spoonacularSearch } from "../services/spoonacular.service.js";
import { rankRecipes } from "../services/ranking.service.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";

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
    userId:req.user?._id
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
    userId:req.user?._id
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

  const user = await User.findById(req.user._id).lean();
  if (!user) {
    return res.status(404).json(new apiResponse(404, "User not found"));
  }

  const dietPreference = user.profile?.dietPreference;
  const cookingSkill = user.profile?.cookingSkill;
  const cuisines = user.preferences?.cuisines || [];
  const budget = user.preferences?.budgetRange || {};

  // =========================================================
  // 🔥 2️⃣ BUILD FILTER FROM PROFILE
  // =========================================================

  const filter = {};

  // ✅ Diet
  if (dietPreference && dietPreference !== "Any") {
    filter["metadata.dietType"] = dietPreference;
  }

  // ✅ Difficulty mapping (IMPORTANT FIX)
  const difficultyMap = {
    Beginner: ["Beginner"],
    Intermediate: ["Beginner", "Intermediate"],
    Expert: ["Beginner", "Intermediate", "Expert"],
  };

  if (cookingSkill) {
    filter["metadata.difficulty"] = {
      $in: difficultyMap[cookingSkill] || ["Beginner"],
    };
  }

  // ✅ Cuisine
  if (cuisines.length > 0) {
    const lowerCuisines = cuisines.map((c) => c.toLowerCase());

    filter.$or = [
      { "metadata.cuisine": { $in: lowerCuisines } },
      { tags: { $in: lowerCuisines } },
    ];
  }

  // ✅ Budget
  if (budget.min !== undefined || budget.max !== undefined) {
    filter["metadata.costEstimate"] = {};

    if (typeof budget.min === "number") {
      filter["metadata.costEstimate"].$gte = budget.min;
    }

    if (typeof budget.max === "number") {
      filter["metadata.costEstimate"].$lte = budget.max;
    }

    if (Object.keys(filter["metadata.costEstimate"]).length === 0) {
      delete filter["metadata.costEstimate"];
    }
  }

  const allergies = user.profile?.allergies || [];

  if (allergies.length) {
    filter.$nor = [
      { "ingredients.name": { $in: allergies.map((a) => new RegExp(a, "i")) } },
    ];
  }

  // ✅ Ensure valid recipes
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

  res.json({
    success: true,
    source: "database",
    meta: {
      page: pageNum,
      limit: pageSize,
      hasMore: dbResults.length === pageSize, // 🔥 KEY
    },
    count: dbResults.length,
    data: rankRecipes(dbResults),
  });
});

export { searchRecipes, dbSearchRecipes };
