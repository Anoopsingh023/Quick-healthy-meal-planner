import Fuse from "fuse.js";
import { apiResponse } from "./apiResponse.js";
import { asyncHandler } from "./asyncHandler.js";

let suggestionList = [];
let fuse = null;

// 🔥 Build suggestions list
export const buildSuggestions = async (recipes) => {
  const set = new Set();

  recipes.forEach((r) => {
    set.add(r.title);

    r.ingredients?.forEach((i) => set.add(i.name));
    r.tags?.forEach((t) => set.add(t));

    if (r.metadata?.cuisine) {
      set.add(r.metadata.cuisine);
    }
  });

  suggestionList = Array.from(set);

  fuse = new Fuse(suggestionList, {
    includeScore: true,
    threshold: 0.3,
  });

  console.log("🔥 Suggestions ready:", suggestionList.length);
};

// 🔥 Get suggestions
export const getSuggestions = asyncHandler(async(req,res) => {
  const { query } = req.query;
  if (!query || !fuse) return [];

  const results = fuse.search(query);

  return res
  .status(200)
  .json(
    new apiResponse(
      200,
      results.slice(0, 8).map((r) => r.item),
      "suggestion fetch successfully",
    ),
  );
});
