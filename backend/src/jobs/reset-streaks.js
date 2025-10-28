import cron from "node-cron";
import { User } from "../models/user.model.js";

export const scheduleStreakResetJob = () => {
  // Runs every day at 12:10 AM
  cron.schedule("10 0 * * *", async () => {
    try {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Find users who haven't cooked yesterday or today
      const result = await User.updateMany(
        {
          $or: [
            { "gamification.lastCookedAt": { $lt: yesterday } },
            { "gamification.lastCookedAt": { $exists: false } },
          ],
        },
        {
          $set: { "gamification.streak": 0 },
        }
      );

      console.log(
        `[CRON] ${new Date().toLocaleString()} - Streaks reset for ${result.modifiedCount} users`
      );
    } catch (err) {
      console.error("[CRON ERROR] Failed to reset streaks:", err);
    }
  });
};
