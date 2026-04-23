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

connectDb()
  .then(() => {
    scheduleStreakResetJob();
    console.log("✅ Cron job initialized: Daily streak reset scheduled.");
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("MongoDB connection failed !!!");
  });

connectRedis();


(async () => {
  await getEmbedding("hello");
  console.log("🔥 Model preloaded");
})();


(async () => {
  const recipes = await Recipe.find().select("title ingredients metadata tags");

  await buildDictionary(recipes);
  initAutoCorrect();

  console.log("🔥 Auto-correct ready");
})();

(async () => {
  const recipes = await Recipe.find().select(
    "title ingredients metadata tags"
  );

  await buildSuggestions(recipes);
})();



