import { Recipe } from "../models/recipe.model.js";
import { mapSpoonacularToRecipe } from "../utils/mapper.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import axios from "axios";

// Create Recipe (Manual)
const createRecipe = asyncHandler(async (req, res) => {
  const recipeData = req.body; // should match your schema
  const recipe = new Recipe({ ...recipeData, createdBy: req.user?._id });
  await recipe.save();

  res
    .status(201)
    .json(new apiResponse(200, recipe, "Recipe created successfully"));
});

// Get User Recipes
const getUserRecipes = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const recipes = await Recipe.find({ createdBy: userId }).populate(
    "createdBy",
    "userName email"
  );

  res
    .status(200)
    .json(
      new apiResponse(
        200,
        { count: recipes.length, data: recipes },
        "recipe fetched successfully"
      )
    );
});

// Get Single Recipe
const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate(
    "createdBy",
    "userName email"
  );

  if (!recipe) {
    throw new apiError(404, "Recipe not found");
  }

  res
    .status(200)
    .json(new apiResponse(200, recipe, "Recipe fetched successfully"));
});

// Update Recipe
const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new apiError(404, "Recipe not found");
  }

  // Permission check: only creator can update
  if (recipe.createdBy.toString() !== req.user._id.toString()) {
    throw new apiError(403, "not authorized to update this recipe");
  }

  // Perform update
  Object.assign(recipe, req.body);
  await recipe.save();

  res
    .status(200)
    .json(new apiResponse(200, recipe, "Recipe updated successfully"));
});

// Delete Recipe
const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    throw new apiError(404, "Recipe not found");
  }

  // Permission check
  if (recipe.createdBy.toString() !== req.user._id.toString()) {
    throw new apiError(403, "not authorized to delete this recipe");
  }

  await recipe.deleteOne();

  res.status(200).json(new apiResponse(200, {}, "Recipe deleted successfully"));
});

// Search / Filter Recipes
const searchRecipes = asyncHandler(async (req, res) => {
  const {
    query,
    cuisine,
    dietType,
    difficulty,
    costMin,
    costMax,
    costRange,
    page = 1,
    limit = 12,
    sort = "latest",
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, parseInt(limit, 10) || 12); // cap to 50 to avoid heavy API calls

  // Build Mongo filter (same as previous design)
  const filter = {};

  // Text search across fields if query provided
  if (query && query.trim()) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      { tags: { $regex: regex } },
      // { "ingredients.name": { $regex: regex } },
      { "metadata.cuisine": { $regex: regex } },
    ];
  }

  // Cuisine(s)
  if (cuisine) {
    const cuisines = cuisine.split(",").map((c) => c.trim()).filter(Boolean);
    if (cuisines.length) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { "metadata.cuisine": { $in: cuisines } },
        { tags: { $in: cuisines } },
        { cuisines: { $in: cuisines } }
      );
    }
  }

  // Diet Type exact match
  if (dietType) {
    filter["metadata.dietType"] = dietType;
  }

  // Difficulty
  if (difficulty) {
    const diffs = difficulty.split(",").map((d) => d.trim()).filter(Boolean);
    if (diffs.length) filter["metadata.difficulty"] = { $in: diffs };
  }

  // Cost range parsing
  let costLower = undefined;
  let costUpper = undefined;
  if (costRange) {
    const parts = costRange.split("-").map((p) => p.trim());
    if (parts[0]) costLower = Number(parts[0]);
    if (parts[1]) costUpper = Number(parts[1]);
  }
  if (costMin) costLower = Number(costMin);
  if (costMax) costUpper = Number(costMax);

  if (!isNaN(costLower) || !isNaN(costUpper)) {
    filter["metadata.costEstimate"] = {};
    if (!isNaN(costLower)) filter["metadata.costEstimate"].$gte = costLower;
    if (!isNaN(costUpper)) filter["metadata.costEstimate"].$lte = costUpper;
    if (Object.keys(filter["metadata.costEstimate"]).length === 0)
      delete filter["metadata.costEstimate"];
  }

  // Ensure we have ingredients & steps (optional but usually desired)
  filter.$and = filter.$and || [];
  filter.$and.push({ "ingredients.0": { $exists: true } }, { "steps.0": { $exists: true } });

  // Sorting
  let sortObj = { createdAt: -1 };
  if (sort === "costAsc") sortObj = { "metadata.costEstimate": 1 };
  if (sort === "costDesc") sortObj = { "metadata.costEstimate": -1 };
  if (sort === "timeAsc") sortObj = { "metadata.cookingTime": 1 };
  if (sort === "timeDesc") sortObj = { "metadata.cookingTime": -1 };

  // 1) Try DB first
  const [recipesInDb, totalInDb] = await Promise.all([
    Recipe.find(filter)
      .populate("createdBy", "userName email avatar")
      .sort(sortObj)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Recipe.countDocuments(filter),
  ]);

  if (recipesInDb && recipesInDb.length > 0) {
    return res.status(200).json({
      success: true,
      source: "database",
      meta: {
        page: pageNum,
        limit: pageSize,
        total: totalInDb,
        totalPages: Math.ceil(totalInDb / pageSize),
      },
      data: recipesInDb,
    });
  }

  // 2) If DB empty -> query Spoonacular (complexSearch for IDs), then fetch details and save
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: "Spoonacular API key not configured" });
  }

  // Build spoonacular complexSearch query params
  const spParams = new URLSearchParams();
  if (query) spParams.append("query", query);
  spParams.append("number", String(pageSize)); // how many results to request
  // Try to map cuisine param
  if (cuisine) {
    // pass the first cuisine or the comma-separated list
    spParams.append("cuisine", cuisine);
  }
  // Map dietType to Spoonacular diet parameter for common values
  if (dietType) {
    // Spoonacular diet expects values like: "vegetarian", "vegan", "pescetarian", "gluten free"
    const dietMap = {
      Veg: "vegetarian",
      Vegan: "vegan",
      "Non-Veg": "", // no direct mapping; skip
      Any: "",
    };
    const sdiet = dietMap[dietType] || "";
    if (sdiet) spParams.append("diet", sdiet);
  }

  const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?${spParams.toString()}&apiKey=${apiKey}`;

  let searchRes;
  try {
    searchRes = await axios.get(searchUrl);
  } catch (err) {
    console.error("Spoonacular complexSearch error:", err?.response?.data || err.message);
    return res.status(502).json({ success: false, message: "Error fetching from Spoonacular" });
  }

  const results = searchRes.data?.results || [];
  if (!results.length) {
    return res.status(404).json({ success: false, message: "No recipes found (DB or Spoonacular)" });
  }

  // For each result, fetch detailed information and save (or reuse if already present)
  const savedRecipes = [];
  for (const r of results) {
    try {
      // Check local by spoonacularId to avoid duplicate fetch/save
      let existing = await Recipe.findOne({ spoonacularId: r.id });
      if (existing) {
        savedRecipes.push(existing);
        continue;
      }

      const detailUrl = `https://api.spoonacular.com/recipes/${r.id}/information?includeNutrition=true&apiKey=${apiKey}`;
      const detailRes = await axios.get(detailUrl);
      const detailData = detailRes.data;

      const mapped = mapSpoonacularToRecipe(detailData);

      const newRecipe = new Recipe({
        ...mapped,
        spoonacularId: detailData.id,
        source: "Spoonacular",
      });

      await newRecipe.save();
      savedRecipes.push(newRecipe);
    } catch (err) {
      console.error(`Failed to fetch/save recipe id=${r.id}:`, err?.response?.data || err.message);
      // continue to next recipe instead of failing entire flow
    }
  }

  if (!savedRecipes.length) {
    return res.status(502).json({
      success: false,
      message: "Spoonacular returned results but failed to fetch/save details",
    });
  }

  // Return saved recipes (paged up to pageSize)
  return res.status(200).json({
    success: true,
    source: "spoonacular",
    meta: {
      requested: pageSize,
      returned: savedRecipes.length,
    },
    data: savedRecipes,
  });
});

// recomended recipe
const getRecommendedRecipe = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  // 1) Load user preferences
  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const profileDiet = user.profile?.dietPreference; // "Veg", "Vegan", "Non-Veg", "Keto", "Any"
  const cookingSkill = user.profile?.cookingSkill; // "Beginner", "Intermediate", "Expert"
  const allergies = user.profile?.allergies || []; // array of strings
  const prefCuisines = user.preferences?.cuisines || []; // array
  const budget = user.preferences?.budgetRange || {}; // { min, max }

  // Helper: map profile diet to recipe.metadata.dietType values in our schema
  const dietMap = {
    Veg: ["Veg"],
    Vegan: ["Vegan"],
    "Non-Veg": ["Non-Veg"],
    Any: [], // empty -> no filter
    Keto: ["Any", "Veg", "Vegan"], // leave broad; adapt as needed
  };

  // Helper: map cookingSkill to difficulty preference (optional)
  const difficultyMap = {
    Beginner: ["Easy"],
    Intermediate: ["Easy", "Medium"],
    Expert: ["Easy", "Medium", "Hard"],
  };

  // Build base filter
  const filter = {};

  // Diet filter
  if (profileDiet && profileDiet !== "Any") {
    const allowed = dietMap[profileDiet] || [profileDiet];
    // If allowed is empty, skip
    if (allowed.length > 0) filter["metadata.dietType"] = { $in: allowed };
  }

  // Cuisine filter - try metadata.cuisine or tags
  if (prefCuisines.length) {
    filter.$or = [
      { "metadata.cuisine": { $in: prefCuisines } },
      { tags: { $in: prefCuisines } },
    ];
  }

  // Difficulty filter (based on cookingSkill)
  if (cookingSkill) {
    const allowedDifficulties = difficultyMap[cookingSkill] || [];
    if (allowedDifficulties.length) filter["metadata.difficulty"] = { $in: allowedDifficulties };
  }

  // Budget filter (costEstimate is in your schema)
  if (budget && (budget.min !== undefined || budget.max !== undefined)) {
    filter["metadata.costEstimate"] = {};
    if (typeof budget.min === "number") filter["metadata.costEstimate"].$gte = budget.min;
    if (typeof budget.max === "number") filter["metadata.costEstimate"].$lte = budget.max;
    // Remove empty object if neither bound present
    if (Object.keys(filter["metadata.costEstimate"]).length === 0) {
      delete filter["metadata.costEstimate"];
    }
  }

  // Allergy exclusion: make case-insensitive regex list and exclude recipes containing any
  const allergyRegexes = (allergies || [])
    .filter(Boolean)
    .map((a) => new RegExp(`${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"));

  if (allergyRegexes.length) {
    // $nor: { 'ingredients.name': { $in: [ /peanut/i, /gluten/i ] } } ensures none of the ingredients match allergies
    filter.$nor = [{ "ingredients.name": { $in: allergyRegexes } }];
  }

  // Avoid returning recipes that are partial or empty? (Optional)
  // Example: ensure there is at least one ingredient and one step
  filter.$and = filter.$and || [];
  filter.$and.push({ "ingredients.0": { $exists: true } }, { "steps.0": { $exists: true } });

  // 2) Try to get one random recipe matching the strict filter
  let recipeDoc = null;
  try {
    const agg = await Recipe.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
    ]);

    if (agg && agg.length > 0) {
      recipeDoc = agg[0];
    }
  } catch (err) {
    // If aggregation fails for some reason, ignore and fallback
    console.error("Recommendation aggregation error:", err);
  }

  // 3) Fallback strategy if none found: relax filters step-by-step
  if (!recipeDoc) {
    // Relax 1: remove difficulty & cuisine but keep diet & allergies & budget
    const relaxed1 = { ...filter };
    delete relaxed1["metadata.difficulty"];
    delete relaxed1.$or; // remove cuisine constraint
    try {
      const agg1 = await Recipe.aggregate([{ $match: relaxed1 }, { $sample: { size: 1 } }]);
      if (agg1 && agg1.length) recipeDoc = agg1[0];
    } catch (err) {
      console.error("Relaxed1 aggregation error:", err);
    }
  }

  if (!recipeDoc) {
    // Relax 2: remove budget too (keep diet & allergies)
    const relaxed2 = {};
    if (profileDiet && profileDiet !== "Any") {
      const allowed = dietMap[profileDiet] || [profileDiet];
      if (allowed.length) relaxed2["metadata.dietType"] = { $in: allowed };
    }
    if (allergyRegexes.length) relaxed2.$nor = [{ "ingredients.name": { $in: allergyRegexes } }];
    relaxed2.$and = [{ "ingredients.0": { $exists: true } }, { "steps.0": { $exists: true } }];

    try {
      const agg2 = await Recipe.aggregate([{ $match: relaxed2 }, { $sample: { size: 1 } }]);
      if (agg2 && agg2.length) recipeDoc = agg2[0];
    } catch (err) {
      console.error("Relaxed2 aggregation error:", err);
    }
  }

  if (!recipeDoc) {
    // Final fallback: any random recipe
    const anyAgg = await Recipe.aggregate([{ $sample: { size: 1 } }]);
    if (anyAgg && anyAgg.length) recipeDoc = anyAgg[0];
  }

  if (!recipeDoc) {
    return res.status(404).json({ success: false, message: "No recipes available" });
  }

  // 4) Convert aggregated doc to a populated document (to include createdBy fields)
  const populated = await Recipe.findById(recipeDoc._id).populate("createdBy", "userName email avatar");

  res.status(200).json({
    success: true,
    data: populated,
    meta: {
      source: "database",
      appliedFilter: {
        diet: profileDiet || null,
        cuisines: prefCuisines,
        difficulty: cookingSkill || null,
        budget,
        allergies,
      },
    },
  });
});


export {
  createRecipe,
  getUserRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  getRecommendedRecipe,
};
