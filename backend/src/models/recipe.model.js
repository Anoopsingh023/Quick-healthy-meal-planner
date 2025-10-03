import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String, // short intro like "Quick 10-min healthy rice bowl"
  ingredients: [
    {
      name: { type: String, required: true }, // "Tomato"
      quantity: { type: String }, // "2 cups", "1 tbsp"
      optional: { type: Boolean, default: false },
    },
  ],
  steps: [
    {
      stepNumber: Number,
      instruction: { type: String, required: true }, // "Chop onions and tomatoes..."
      time: { type: Number }, // in minutes (optional)
    },
  ],
  metadata: {
    cookingTime: { type: Number, required: true }, // in minutes
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    cuisine: { type: String }, // "Indian", "Chinese", "Italian"
    dietType: {
      type: String,
      enum: ["Veg", "Vegan", "Non-Veg", "Any"],
      default: "Any",
    },
    costEstimate: { type: Number }, // ₹ estimate for recipe
    calories: { type: Number }, // optional, per serving
  },
  tags: [{ type: String }], // ["Budget", "Quick", "Kids-friendly"]
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // if user/AI created it
  source: { type: String }, // e.g., "AI Generated", "Spoonacular", "Manual"
  
},{timestamps: true});

export const Recipe = mongoose.model("Recipe", recipeSchema);
