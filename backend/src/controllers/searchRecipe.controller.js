import { Recipe } from "../models/recipe.model.js";


const uploadedModelPath = "sandbox:/mnt/data/recipe.model.js";

export const dbSearchRecipes = async (req, res) => {
  try {
    const {
      q,
      cuisine,
      dietType,
      foodType,
      tags,
      includeIngredients,
      excludeIngredients,
      maxCookingTime,
      difficulty,
      page = 1,
      limit = 12,
      sort = "latest",
    } = req.query;

    const filter = {};

    const escapeRegex = (str) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Text / fuzzy search on title, description (case-insensitive)
    if (q) {
      const safe = q.trim();
      const regex = new RegExp(escapeRegex(safe), "i");
      filter.$or = filter.$or || [];
      filter.$or.push(
        { title: regex },
        { description: regex },
        { "metadata.cuisine": regex },
        { tags: regex }
      );
    }

    // Cuisine(s)
    if (cuisine) {
      const arr = cuisine
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) {
        filter.$or = filter.$or || [];
        // match either metadata.cuisine OR tags
        filter.$or.push(
          { "metadata.cuisine": { $in: arr } },
          { tags: { $in: arr } }
        );
        
        arr.forEach((term) => {
          const safe = term;
          const regex = new RegExp(escapeRegex(safe), "i");
          filter.$or.push({ title: regex });
          filter.$or.push({ description: regex });
        });
      }
      
    }

    // Diet Type
    if (dietType) {
      filter["metadata.dietType"] = dietType;
    }

    // Food Type(s) - NOTE: metadata.foodType may be missing for older records,
    // so we check metadata.foodType, tags, AND FALLBACK to matching title/description.
    if (foodType) {
      const arr = foodType
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (arr.length) {
        filter.$or = filter.$or || [];

        // Match metadata.foodType or tags directly
        filter.$or.push({ "metadata.foodType": { $in: arr } });
        filter.$or.push({ tags: { $in: arr } });

        // Additionally, fallback to searching title/description for the foodType keywords.
        // Create regex entries for each term (case-insensitive).
        arr.forEach((term) => {
          const safe = term;
          const regex = new RegExp(escapeRegex(safe), "i");
          filter.$or.push({ title: regex });
          filter.$or.push({ description: regex });
        });
      }
    }

    // Tags (require all)
    if (tags) {
      const arr = tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) filter.tags = { $all: arr };
    }

    // Include ingredients: require all provided ingredient names (case-sensitive depends on DB)
    if (includeIngredients) {
      const arr = includeIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) {
        // Build $and with $elemMatch for each ingredient name
        filter.$and = filter.$and || [];
        arr.forEach((iname) => {
          filter.$and.push({ ingredients: { $elemMatch: { name: iname } } });
        });
      }
    }

    // Exclude ingredients: ensure none of the listed names appear in ingredients
    if (excludeIngredients) {
      const arr = excludeIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.length) {
        filter.$nor = filter.$nor || [];
        filter.$nor.push({ ingredients: { $elemMatch: { name: { $in: arr } } } });
      }
    }

    // Max cooking time
    if (maxCookingTime) {
      const num = Number(maxCookingTime);
      if (!isNaN(num)) {
        filter["metadata.cookingTime"] = { $lte: num };
      }
    }

    // Difficulty
    if (difficulty) {
      filter["metadata.difficulty"] = difficulty;
    }

    // Pagination & sorting
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    const skip = (pageNum - 1) * pageSize;

    let sortObj = { createdAt: -1 }; // default latest
    if (sort === "oldest") sortObj = { createdAt: 1 };
    if (sort === "timeAsc") sortObj = { "metadata.cookingTime": 1 };
    if (sort === "timeDesc") sortObj = { "metadata.cookingTime": -1 };
    if (sort === "caloriesAsc") sortObj = { "metadata.calories": 1 };
    if (sort === "caloriesDesc") sortObj = { "metadata.calories": -1 };

    // Only fetch from DB
    const [total, recipes] = await Promise.all([
      Recipe.countDocuments(filter),
      Recipe.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    res.json({
      success: true,
      meta: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
        modelFile: uploadedModelPath, // providing the uploaded model path for tooling if needed
      },
      data: recipes,
    });
  } catch (err) {
    console.error("dbSearchRecipes error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
