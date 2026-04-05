import {
  generateMultipleRecipes,
  getRecipeImage,
} from "../services/geminiRecipe.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Recipe } from "../models/recipe.model.js";
import crypto from "crypto";

const normalizeDietType = (diet) => {
  if (!diet) return "Any";

  const d = diet.toLowerCase();

  if (d.includes("veg") && !d.includes("non")) return "Veg";
  if (d.includes("vegan")) return "Vegan";
  if (d.includes("non")) return "Non-Veg";

  return "Any";
};

const normalizeDifficulty = (diff) => {
  if (!diff) return "Beginner";

  const d = diff.toLowerCase();
  if (d.includes("Easy")) return "Beginner";
  if (d.includes("Medium")) return "Intermediate";
  if (d.includes("Hard")) return "Expert";

  return "Beginner";
};

const cleanAIRecipe = (recipe) => {
  return {
    ...recipe,
    metadata: {
      ...recipe.metadata,
      dietType: normalizeDietType(recipe.metadata?.dietType),
      difficulty: normalizeDifficulty(recipe.metadata?.difficulty),
    },
  };
};

const generateRecipeHash = (recipe) => {
  const base = `${recipe.title}-${recipe.ingredients
    .map((i) => i.name.toLowerCase())
    .sort()
    .join(",")}`;

  return crypto.createHash("md5").update(base).digest("hex");
};

const checkRecipeExists = async (recipe) => {
  const hash = generateRecipeHash(recipe);

  const existing = await Recipe.findOne({ hash });

  return existing;
};

const generateCacheKey = (user, query) => {
  return `${query.toLowerCase()}-${user.profile?.dietPreference}-${user.profile?.cookingSkill}`;
};

const streamAIRecipes = asyncHandler(async (req, res) => {
  const user = req.user;
  const { query } = req.query;

  if (!query) {
    return res.status(400).end();
  }

  const cacheKey = generateCacheKey(user, query);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 🔥 1. CHECK CACHE FIRST
  const cachedRecipes = await Recipe.find({
    cacheKey,
    source: "AI Generated",
    image: { $ne: null }, // ✅ only fully ready recipes
  }).limit(5);

  if (cachedRecipes.length > 0) {
    for (const recipe of cachedRecipes) {
      res.write(`data: ${JSON.stringify(recipe)}\n\n`);
    }

    res.write("event: end\ndata: done\n\n");
    return res.end();
  }

  // 🔥 2. CALL GEMINI IF NO CACHE
  const recipes = await generateMultipleRecipes(user, query);

  const savedRecipes = [];
  const imagePromises = []; // 👈 ADD THIS

  for (let i = 0; i < recipes.length; i++) {
    const cleaned = cleanAIRecipe(recipes[i]);

    // 👇 dedup check before saving
    const exists = await checkRecipeExists(cleaned);

    let savedRecipe = null;

    if (!exists) {
      const hash = generateRecipeHash(cleaned);

      savedRecipe = await Recipe.create({
        ...cleaned,
        image: null,
        hash,
        cacheKey, // store cache
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // ⏱ 1 hour
        createdBy: user._id,
        source: "AI Generated",
      });
    }

    const recipeToSend = savedRecipe || cleaned;

    const recipeId = savedRecipe?._id || exists?._id;

    savedRecipes.push(recipeToSend);

    // 🚀 SEND IMMEDIATELY (FAST)
    res.write(
      `data: ${JSON.stringify({
        recipe: recipeToSend,
        isImageLoading: true, // 👈 important
      })}\n\n`,
    );

    // 🔥 Step 2: Generate image in background
    const imagePromise = getRecipeImage(recipeToSend.title).then((imageUrl) => {
      if (imageUrl && recipeId) {
        return Recipe.findByIdAndUpdate(recipeId, {
          image: imageUrl,
        }).then(() => {
          // console.log("Image url : ",imageUrl)
          res.write(
            `event: image\n` +
              `data: ${JSON.stringify({
                recipeId,
                image: imageUrl,
                isImageLoading: false,
              })}\n\n`,
          );
        });
      }
    });
    imagePromises.push(imagePromise);

    await new Promise((r) => setTimeout(r, 500)); // simulate stream
  }
  // ✅ WAIT FOR ALL IMAGES
  await Promise.all(imagePromises);

  // 🔥 extra DB check (important)
await new Promise((r) => setTimeout(r, 300));

  res.write("event: end\ndata: done\n\n");
  res.end();
});


export { streamAIRecipes };
