import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Recipe } from "../models/recipe.model.js";
import { ShoppingList } from "../models/shopinglist.model.js";
import mongoose from "mongoose";
import {
  getBudgetSuggestions,
  getSubstitutes,
  getSmartQuantities,
  getPriorities,
  getWeeklyPlan,
} from "../services/smartGrocery/Smartshoppingai.service.js";

// ─── helpers ──────────────────────────────────────────────────────────────────
const normalize = (name) => name.toLowerCase().trim().replace(/\s+/g, " ");

const getOrCreateList = async (userId) => {
  let list = await ShoppingList.findOne({ userId });
  if (!list) list = await ShoppingList.create({ userId, items: [] });
  return list;
};

// ─── existing CRUD ────────────────────────────────────────────────────────────

const getShoppingList = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const list = await ShoppingList.findOne({ userId }).lean();
  return res
    .status(200)
    .json(new apiResponse(200, { items: list?.items || [] }));
});

const addItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name, quantity = "", category = "Other", estimatedPrice } = req.body;

  if (!name?.trim()) throw new apiError(400, "Item name is required");

  const normalizedName = normalize(name);
  const price = estimatedPrice ?? 0;

  // merge if already exists
  const updated = await ShoppingList.findOneAndUpdate(
    { userId, "items.normalizedName": normalizedName },
    { $set: { "items.$.quantity": quantity } },
    { new: true },
  );

  if (updated) {
    return res.status(200).json(new apiResponse(200, { items: updated.items }));
  }

  const newItem = {
    _id: new mongoose.Types.ObjectId(),
    name,
    normalizedName,
    quantity,
    category,
    estimatedPrice: price,
  };

  const list = await ShoppingList.findOneAndUpdate(
    { userId },
    { $push: { items: { $each: [newItem], $position: 0 } } },
    { new: true, upsert: true },
  );

  return res.status(200).json(new apiResponse(200, { items: list.items }));
});

const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  const list = await ShoppingList.findOneAndUpdate(
    { userId },
    { $pull: { items: { _id: itemId } } },
    { new: true },
  );

  return res
    .status(200)
    .json(new apiResponse(200, { items: list?.items || [] }));
});

const togglePurchased = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  await ShoppingList.updateOne(
    { userId, "items._id": new mongoose.Types.ObjectId(itemId) },
    [
      {
        $set: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    status: {
                      $cond: [
                        {
                          $and: [
                            { $eq: ["$$item._id", new mongoose.Types.ObjectId(itemId)] },
                            { $eq: ["$$item.status", "pending"] },
                          ],
                        },
                        "purchased",
                        {
                          $cond: [
                            { $eq: ["$$item._id", new mongoose.Types.ObjectId(itemId)] },
                            "pending",
                            "$$item.status",
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ]
  );

  const list = await ShoppingList.findOne({ userId }).lean();
  return res
    .status(200)
    .json(new apiResponse(200, { items: list?.items || [] }));
});

const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity, category } = req.body;
  const userId = req.user._id;

  const updateFields = {};
  if (quantity !== undefined) updateFields["items.$.quantity"] = quantity;
  if (category !== undefined) updateFields["items.$.category"] = category;

  const list = await ShoppingList.findOneAndUpdate(
    { userId, "items._id": itemId },
    { $set: updateFields },
    { new: true },
  );

  if (!list) throw new apiError(404, "Item not found");
  return res.status(200).json(new apiResponse(200, { items: list.items }));
});

const generateFromRecipe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { recipeId } = req.body;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) throw new apiError(404, "Recipe not found");

  const newItems = recipe.ingredients.map((ing) => ({
    _id: new mongoose.Types.ObjectId(),
    name: ing.name,
    img: ing.img,
    normalizedName: normalize(ing.name),
    quantity: ing.quantity || "",
    addedFromRecipe: recipe._id,
    estimatedPrice: 0, // front-end will estimate
  }));

  const list = await ShoppingList.findOne({ userId });
  const existing = new Set(list?.items.map((i) => i.normalizedName));
  const filtered = newItems.filter((i) => !existing.has(i.normalizedName));

  const updated = await ShoppingList.findOneAndUpdate(
    { userId },
    { $push: { items: { $each: filtered, $position: 0 } } },
    { new: true, upsert: true },
  );

  return res.status(200).json(new apiResponse(200, { items: updated.items }));
});

const clearShoppingList = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const list = await getOrCreateList(userId);
  list.items = [];
  await list.save();
  res.status(200).json(new apiResponse(200, {}, "Shopping list cleared"));
});

// ─── AI endpoints ─────────────────────────────────────────────────────────────

const aiSuggest = asyncHandler(async (req, res) => {
  const { budget, spent = 0, remaining, currentItems = [], people = 2, days = 7 } = req.body;
  if (!budget) throw new apiError(400, "budget is required");

  const data = getBudgetSuggestions({ budget, spent, remaining, currentItems, people, days });
  return res.status(200).json(new apiResponse(200, data, "Suggestions generated"));
});


const aiSubstitutes = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  if (!items.length) throw new apiError(400, "items are required");

  const data = getSubstitutes({ items });
  return res.status(200).json(new apiResponse(200, data, "Substitutes generated"));
});

const aiQuantities = asyncHandler(async (req, res) => {
  const { items = [], people = 2, days = 7 } = req.body;
  if (!items.length) throw new apiError(400, "items are required");

  const data = getSmartQuantities({ items, people, days });
  return res.status(200).json(new apiResponse(200, data, "Quantities estimated"));
});

const aiPriorities = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  if (!items.length) throw new apiError(400, "items are required");

  const data = getPriorities({ items });
  return res.status(200).json(new apiResponse(200, data, "Priorities tagged"));
});

const aiWeeklyPlan = asyncHandler(async (req, res) => {
  const { budget, people = 2, days = 7, currentItems = [] } = req.body;
  if (!budget) throw new apiError(400, "budget is required");

  const data = getWeeklyPlan({ budget, people, days, currentItems });
  return res.status(200).json(new apiResponse(200, data, "Weekly plan generated"));
});

const aiSyncPlan = asyncHandler(async (req, res) => {
  const userId             = req.user._id;
  const { ingredients = [] } = req.body;
  if (!ingredients.length) throw new apiError(400, "ingredients are required");

  const newItems = ingredients.map((ing) => ({
    _id:            new mongoose.Types.ObjectId(),
    name:           ing.name,
    normalizedName: ing.name.toLowerCase().trim().replace(/\s+/g, " "),
    quantity:       ing.quantity || "",
    category:       ing.category || "Other",
    estimatedPrice: ing.estimatedPrice || 0,
    aiGenerated:    true,
  }));

  const list     = await ShoppingList.findOne({ userId });
  const existing = new Set(list?.items.map((i) => i.normalizedName));
  const filtered = newItems.filter((i) => !existing.has(i.normalizedName));

  const updated = await ShoppingList.findOneAndUpdate(
    { userId },
    { $push: { items: { $each: filtered, $position: 0 } } },
    { new: true, upsert: true },
  );

  return res.status(200).json(
    new apiResponse(200, { items: updated.items }, `${filtered.length} ingredients synced to list`)
  );
});

// ─── exports ──────────────────────────────────────────────────────────────────
export {
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
};
