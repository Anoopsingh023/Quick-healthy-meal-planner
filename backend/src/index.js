import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
import { scheduleStreakResetJob } from "./jobs/reset-streaks.js";

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
