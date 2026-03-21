import { Router } from "express";
import { getFeed } from "../../controllers/feedController/feed.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

// Get feed
router.get("/", getFeed);

export default router;