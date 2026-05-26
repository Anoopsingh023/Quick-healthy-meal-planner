import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
import { scheduleStreakResetJob } from "./jobs/reset-streaks.js";
import { getEmbedding } from "./utils/embedding.js";
import { buildDictionary, initAutoCorrect } from "./utils/autocorrect.js";
import { buildSuggestions } from "./utils/suggestions.js";
import { Recipe } from "./models/recipe.model.js";
import { connectRedis } from "./config/redisClient.js";

dotenv.config({
  path: "./env",
});

const startServer = async () => {
  try {
    // ✅ Connect MongoDB first
    await connectDb();

    console.log("✅ MongoDB connected");

    // ✅ Connect Redis
    await connectRedis();

    // ✅ Schedule cron jobs
    scheduleStreakResetJob();
    console.log("✅ Cron job initialized");

    // ✅ Preload embedding model
    await getEmbedding("hello");
    console.log("🔥 Model preloaded");

    // ✅ Load recipes AFTER DB connection
    const recipes = await Recipe.find().select(
      "title ingredients metadata tags"
    );

    // ✅ Build autocorrect dictionary
    await buildDictionary(recipes);
    initAutoCorrect();

    console.log("🔥 Auto-correct ready");

    // ✅ Build suggestions
    await buildSuggestions(recipes);

    // ✅ Start server
    app.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("❌ Startup failed:", error);
    process.exit(1);
  }
};

startServer();