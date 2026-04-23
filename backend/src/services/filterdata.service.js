import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";

export const filterdata = async ({ baseResults, user }) => {
  //     const user = await User.findById(req.user._id).lean();
  //   if (!user) {
  //     return res.status(404).json(new apiResponse(404, "User not found"));
  //   }

  const dietPreference = user.profile?.dietPreference;
  const cookingSkill = user.profile?.cookingSkill;
  const cuisines = user.preferences?.cuisines || [];
  const budget = user.preferences?.budgetRange || {};
  const allergies = user.profile?.allergies || [];

  // 🔥 Apply filters manually
  let filteredResults = baseResults;

  // ✅ Diet
  if (dietPreference && dietPreference !== "Any") {
    filteredResults = filteredResults.filter(
      (r) => r.metadata?.dietType === dietPreference,
    );
  }

  // ✅ Difficulty
  const difficultyMap = {
    Beginner: ["Beginner"],
    Intermediate: ["Beginner", "Intermediate"],
    Expert: ["Beginner", "Intermediate", "Expert"],
  };

  if (cookingSkill) {
    const allowed = difficultyMap[cookingSkill] || ["Beginner"];
    filteredResults = filteredResults.filter((r) =>
      allowed.includes(r.metadata?.difficulty),
    );
  }

  // ✅ Cuisine
  if (cuisines.length > 0) {
    const lowerCuisines = cuisines.map((c) => c.toLowerCase());
    filteredResults = filteredResults.filter(
      (r) =>
        lowerCuisines.includes(r.metadata?.cuisine) ||
        (r.tags || []).some((tag) => lowerCuisines.includes(tag)),
    );
  }

  // ✅ Budget
  if (budget.min !== undefined || budget.max !== undefined) {
    filteredResults = filteredResults.filter((r) => {
      const cost = r.metadata?.costEstimate ?? 0;
      if (budget.min !== undefined && cost < budget.min) return false;
      if (budget.max !== undefined && cost > budget.max) return false;
      return true;
    });
  }

  // ✅ Allergies
  if (allergies.length > 0) {
    filteredResults = filteredResults.filter((r) => {
      const ingredients = r.ingredients?.map((i) => i.name.toLowerCase()) || [];
      return !allergies.some((a) =>
        ingredients.some((ing) => ing.includes(a.toLowerCase())),
      );
    });
  }

  return filteredResults;
};
