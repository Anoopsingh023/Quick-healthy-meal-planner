import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getSuggestions } from "../utils/suggestions.js";

const router = express.Router();

router.get("/suggestions",protect, getSuggestions);

export default router;