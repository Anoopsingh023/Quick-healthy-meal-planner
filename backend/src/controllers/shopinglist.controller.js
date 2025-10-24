import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { Recipe } from "../models/recipe.model.js";
import { ShoppingList } from "../models/shopinglist.model.js";
import mongoose from "mongoose";

/**
 * Helper: get or create shopping list document for user
 */
const getOrCreateList = async (userId) => {
  let list = await ShoppingList.findOne({ userId });
  if (!list) {
    list = await ShoppingList.create({ userId, items: [] });
  }
  return list;
};

// get shoping list
const getShoppingList = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const list = await getOrCreateList(userId);

  if (!list) throw new apiError(404, {}, "No shopping list found");

  res.status(200).json(new apiResponse(200, list, "Shopping list fetched"));
});

// Add item
const addItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    name,
    quantity = "",
    category = "",
    isPurchased = false,
    addedFromRecipe = null,
  } = req.body;

  if (!name || !String(name).trim()) {
    throw new apiError(400, "Item name is required");
  }

  const list = await getOrCreateList(userId);

  const newItem = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: String(name).trim(),
    quantity: String(quantity),
    category: String(category),
    isPurchased: !!isPurchased,
    addedFromRecipe: addedFromRecipe || null,
  };

  list.items.unshift(newItem); // put new items at start
  await list.save();

  res
    .status(200)
    .json(
      new apiResponse(200, { list: newItem }, "Item(s) added to shopping list")
    );
});

// Remove item
const removeItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  if (!itemId)
    return res.status(400).json({ success: false, message: "itemId required" });

  const list = await getOrCreateList(userId);

  const prevLength = list.items.length;
  list.items = list.items.filter((it) => String(it._id) !== String(itemId));
  if (list.items.length === prevLength) {
    throw new apiError(404, "Item not found");
  }

  await list.save();
  res
    .status(200)
    .json(new apiResponse(200, {}, "Item removed from shopping list"));
});

// Toggle purchase
const togglePurchased = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemId } = req.params;
  const patch = req.body || {};

  if (!itemId) throw new apiError(400, "itemId required");

  const list = await getOrCreateList(userId);

  const idx = list.items.findIndex((it) => String(it._id) === String(itemId));
  if (idx === -1){
    throw new apiError(400, "item not found");
  }

  // update allowed fields
  if (Object.prototype.hasOwnProperty.call(patch, "quantity")) {
    list.items[idx].quantity = String(patch.quantity || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "category")) {
    list.items[idx].category = String(patch.category || "");
  }
  if (Object.prototype.hasOwnProperty.call(patch, "isPurchased")) {
    list.items[idx].isPurchased = !!patch.isPurchased;
  } else {
    // if isPurchased isn't present, toggle it
    list.items[idx].isPurchased = !list.items[idx].isPurchased;
  }

  await list.save();
  res
    .status(200)
    .json(
      new apiResponse(
        200,
        list,
        `Item marked as ${list.items[idx].isPurchased ? "purchased" : "not purchased"}`
      )
    );
});

const updateItem = asyncHandler(async (req, res) => {
  const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity, category } = req.body || {};

    if (!itemId) {
      return res.status(400).json({ success: false, message: "itemId required" });
    }

    // find the user's shopping list
    const list = await ShoppingList.findOne({ userId });
    if (!list) {
      return res.status(404).json({ success: false, message: "Shopping list not found" });
    }

    // find item by id
    const idx = list.items.findIndex((it) => String(it._id) === String(itemId));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Apply updates only if provided
    let changed = false;
    if (typeof quantity !== "undefined") {
      list.items[idx].quantity = String(quantity);
      changed = true;
    }
    if (typeof category !== "undefined") {
      list.items[idx].category = String(category);
      changed = true;
    }

    if (!changed) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    await list.save();

    return res.status(200).json(new apiResponse(200,{item:list.items},"item is Updated"));
});

// generate list from recipe
const generateFromRecipe = asyncHandler(async (req, res) => {
  const userId = req.user._id;
    const { recipeId } = req.params;
    if (!recipeId) throw new apiError(400, "recipeId required")

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new apiError(400, "recipeId not found")

    const list = await getOrCreateList(userId);

    // Map recipe.ingredients (defensive: ensure array)
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    // turn each ingredient into shopping item
    const newItems = ingredients.map((ing) => ({
      _id: new mongoose.Types.ObjectId().toString(),
      name: String(ing.name || "").trim(),
      quantity: String(ing.quantity || ""),
      category: "", // optional mapping if you have ingredient categories
      isPurchased: false,
      addedFromRecipe: recipe._id,
    })).filter(it => it.name); // drop empty names

    // preprend new items but avoid duplicates by name (simple dedupe)
    const existingNames = new Set(list.items.map(it => String(it.name).toLowerCase()));
    const itemsToAdd = newItems.filter(it => !existingNames.has(String(it.name).toLowerCase()));

    if (itemsToAdd.length > 0) {
      list.items = [...itemsToAdd, ...list.items];
      await list.save();
    }

  res
    .status(200)
    .json(new apiResponse(200, list, "Shopping list generated from recipe"));
});

// clear shoping list
const clearShoppingList = asyncHandler(async (req, res) => {
  const userId = req.user._id;
    const list = await getOrCreateList(userId);
    list.items = [];
    await list.save();

  res.status(200).json(new apiResponse(200, {}, "Shopping list cleared"));
});

export {
  addItem,
  removeItem,
  togglePurchased,
  updateItem,
  generateFromRecipe,
  getShoppingList,
  clearShoppingList,
};
