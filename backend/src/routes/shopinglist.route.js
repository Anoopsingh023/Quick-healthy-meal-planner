import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getShoppingList,
  addItem,
  removeItem,
  togglePurchased,
  updateItem,
  generateFromRecipe,
  clearShoppingList,
  // AI
  aiSuggest,
  aiSubstitutes,
  aiQuantities,
  aiPriorities,
  aiWeeklyPlan,
  aiSyncPlan,
} from "../controllers/shopinglist.controller.js";

const router = Router();

// All routes require auth
router.use(protect);

// ── CRUD ──────────────────────────────────────────────────────────────────────
router.get("/", getShoppingList);
router.post("/add", addItem);
router.delete("/remove/:itemId", removeItem);
router.patch("/toggle/:itemId", togglePurchased);
router.patch("/update/:itemId", updateItem);
router.post("/from-recipe", generateFromRecipe);
router.delete("/clear", clearShoppingList);

// ── AI ────────────────────────────────────────────────────────────────────────
router.post("/ai/suggest", aiSuggest);
router.post("/ai/substitutes", aiSubstitutes);
router.post("/ai/quantities", aiQuantities);
router.post("/ai/priorities", aiPriorities);
router.post("/ai/weekly-plan", aiWeeklyPlan);
router.post("/ai/sync-plan", aiSyncPlan);

export default router;
