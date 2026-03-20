import mongoose from "mongoose";

const ingredientImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  image: {
    type: String, // image url
    required: true,
  },
});

export const IngredientImage = mongoose.model(
  "IngredientImage",
  ingredientImageSchema,
);
