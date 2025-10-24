import express from "express";
import {
  addItem,
  removeItem,
  togglePurchased,
  updateItem,
  generateFromRecipe,
  getShoppingList,
  clearShoppingList,
} from "../controllers/shopinglist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/add", addItem);
router.delete("/remove/:itemId", removeItem);
router.patch("/toggle/:itemId", togglePurchased);
router.patch("/update/:itemId", updateItem);
router.post("/generate/:recipeId", generateFromRecipe);
router.get("/", getShoppingList);
router.delete("/clear", clearShoppingList);

export default router;
