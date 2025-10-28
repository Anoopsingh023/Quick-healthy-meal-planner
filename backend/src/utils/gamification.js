// /utils/gamification.js
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { BADGES } from "../config/badges.js";
import { apiError } from "./apiError.js";
import { asyncHandler } from "./asyncHandler.js";

/* date helpers */
const toMidnight = (d) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const isSameDay = (a, b) => toMidnight(a).getTime() === toMidnight(b).getTime();
const isYesterday = (lastDate, now = new Date()) => {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return toMidnight(lastDate).getTime() === toMidnight(yesterday).getTime();
};

export const awardBadge = asyncHandler(async (userId, badgeKey) => {
  const badgeDef = BADGES[badgeKey];
  if (!badgeDef) throw new Error("Unknown badge key: " + badgeKey);

  const user = await User.findById(userId).select(
    "gamification badges gamification.points"
  );
  if (!user) throw new apiError(404, "User not found");

  const hasBadge = user.gamification?.badges?.includes(badgeKey);
  if (hasBadge) return false; // already has it

  await User.findByIdAndUpdate(userId, {
    $addToSet: { "gamification.badges": badgeKey },
    $inc: { "gamification.points": badgeDef.points || 0 },
  });

  return true;
});

export const recordCook = asyncHandler(async (userId, options = {}) => {
  // options: { recipeId, recipeCost, recipeMetadata }
  const now = new Date();
  const user = await User.findById(userId).select("gamification");
  if (!user) throw new apiError(404, "User not found");

  const lastCookedAt = user.gamification?.lastCookedAt;
  let newStreak = 1;

  if (lastCookedAt) {
    if (isSameDay(lastCookedAt, now)) {
      // Already recorded today -> do not increment streak or cookedCount again
      newStreak = user.gamification.streak;
      await User.findByIdAndUpdate(userId, {
        $inc: { "gamification.cookedCount": 1 },
      });
    } else if (isYesterday(lastCookedAt, now)) {
      newStreak = (user.gamification.streak || 0) + 1;
      await User.findByIdAndUpdate(userId, {
        $set: {
          "gamification.lastCookedAt": now,
          "gamification.streak": newStreak,
        },
        $inc: { "gamification.cookedCount": 1, "gamification.points": 5 },
      });
    } else {
      // broke streak
      newStreak = 1;
      await User.findByIdAndUpdate(userId, {
        $set: { "gamification.lastCookedAt": now, "gamification.streak": 1 },
        $inc: { "gamification.cookedCount": 1, "gamification.points": 3 },
      });
    }
  } else {
    // first cook ever
    await User.findByIdAndUpdate(userId, {
      $set: { "gamification.lastCookedAt": now, "gamification.streak": 1 },
      $inc: { "gamification.cookedCount": 1, "gamification.points": 10 },
    });
  }

  // award badges based on new state (fetch updated quick)
  const updated = await User.findById(userId).select("gamification");
  const cookedCount = updated.gamification.cookedCount || 0;
  const streak = updated.gamification.streak || 0;

  // First cook
  if (cookedCount === 1) await awardBadge(userId, "FIRST_COOK");

  // Cook 10 times
  if (cookedCount === 10) await awardBadge(userId, "COOK_10");

  // Streak badges
  if (streak >= 3) await awardBadge(userId, "STREAK_3");
  if (streak >= 7) await awardBadge(userId, "STREAK_7");

  // Budget saver example
  if (
    options.recipeCost != null &&
    options.userBudget != null &&
    options.recipeCost <= options.userBudget
  ) {
    await awardBadge(userId, "BUDGET_SAVER");
  }

  return {
    streak: updated.gamification.streak,
    cookedCount: updated.gamification.cookedCount,
  };
});
