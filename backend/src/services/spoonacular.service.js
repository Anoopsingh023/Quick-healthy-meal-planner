import axios from "axios";
import { Recipe } from "../models/recipe.model.js";
import { mapSpoonacularToRecipe } from "../utils/mapper.js";
import { getEmbedding } from "../utils/embedding.js";
import { createHash } from "../utils/hash.js";

export const spoonacularSearch = async ({ query, cuisine, limit }) => {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey || !query) return [];

  // ---------------- 🔥 PRE-FETCH USER DATA ----------------
    let savedSet = new Set();
    let likedSet = new Set();
  
    if (userId) {
      const [user, likes] = await Promise.all([
        User.findById(userId).select("savedRecipes"),
        Like.find({
          likedBy: userId,
          targetType: "Recipe",
        }).select("target"),
      ]);
  
      if (user?.savedRecipes) {
        savedSet = new Set(user.savedRecipes.map((id) => id.toString()));
      }
  
      if (likes) {
        likedSet = new Set(likes.map((l) => l.target.toString()));
      }
    }

  try {
    // 🔥 Step 1: search IDs
    const params = new URLSearchParams();
    params.append("query", query);
    params.append("number", limit);
    if (cuisine) params.append("cuisine", cuisine);

    const searchUrl = `https://api.spoonacular.com/recipes/complexSearch?${params}&apiKey=${apiKey}`;
    const searchRes = await axios.get(searchUrl);

    const results = searchRes.data?.results || [];
    if (!results.length) return [];

    // 🔥 Step 2: fetch details in parallel
    const details = await Promise.all(
      results.map((r) =>
        axios.get(
          `https://api.spoonacular.com/recipes/${r.id}/information?includeNutrition=true&apiKey=${apiKey}`,
        ),
      ),
    );

    const savedRecipes = [];

    for (const d of details) {
      const data = d.data;
      const mapped = mapSpoonacularToRecipe(data);

      const hash = createHash(
        mapped.title +
          JSON.stringify(mapped.ingredients) +
          mapped.metadata?.cuisine,
      );

      let existing = await Recipe.findOne({ hash }).lean();

      if (existing) {
        savedRecipes.push(existing);
        continue;
      }

      const text = `${mapped.title} 
      ${mapped.description || ""} 
      Cuisine: ${mapped.metadata?.cuisine || ""} 
      Diet: ${mapped.metadata?.dietType || ""} 
      Ingredients: ${mapped.ingredients?.map((i) => i.name).join(", ")} 
      Tags: ${mapped.tags?.join(", ")}`;
      const embedding = await getEmbedding(text);

      const newRecipe = await Recipe.create({
        ...mapped,
        embedding,
        hash,
        source: "Spoonacular",
        spoonacularId: data.id,
        isVerified: true,
        stats: { rating: 4, ratingCount: 100 },
        // expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      savedRecipes.push(newRecipe);
    }

    // return savedRecipes;
    return savedRecipes.map((r) => ({
      _id: r._id,
      title: r.title,
      image: r.image,

      metadata: {
        cuisine: r.metadata?.cuisine,
        calories: r.metadata?.calories,
        dietType: r.metadata?.dietType,
        cookingTime: r.metadata?.cookingTime,
        costEstimate: r.metadata?.costEstimate,
      },

      stats: {
        rating: r.stats?.rating,
      },
      isSaved: savedSet.has(r._id.toString()),
      isLiked: likedSet.has(r._id.toString()),

      source: r.source,
      isVerified: r.isVerified,

      // optional UI flag
      isLiked: false, // (can be updated later using userId)
    }));
  } catch (err) {
    console.error("Spoonacular error:", err.message);
    return [];
  }
};
