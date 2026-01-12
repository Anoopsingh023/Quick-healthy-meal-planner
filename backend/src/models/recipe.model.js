import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  description: String, // short intro like "Quick 10-min healthy rice bowl"
  ingredients: [
    {
      img:{ type: String},
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
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner",
    },
    cuisine: { type: String }, // "Indian", "Chinese", "Italian"
    dietType: {
      type: String,
      enum: ["Veg", "Vegan", "Non-Veg", "Any"],
      default: "Any",
    },
    foodType: [{ type: String }],
    costEstimate: { type: Number }, // ₹ estimate for recipe
    calories: { type: Number }, // optional, per serving
  },
  
  tags: [{ type: String }], // ["Budget", "Quick", "Kids-friendly"]
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // if user/AI created it
  source: { type: String }, // e.g., "AI Generated", "Spoonacular", "Manual"
  
},{timestamps: true});

recipeSchema.index({ "metadata.cuisine": 1 });
recipeSchema.index({ "metadata.dietType": 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ "metadata.foodType": 1 });

recipeSchema.pre("save", function(next) {
  if (this.metadata.foodType) {
    this.metadata.foodType = this.metadata.foodType.map(t => t.toLowerCase());
  }
  if (this.tags) {
    this.tags = this.tags.map(t => t.toLowerCase());
  }
  if (this.metadata.cuisine) {
    this.metadata.cuisine = this.metadata.cuisine.toLowerCase();
  }
  next();
});


export const Recipe = mongoose.model("Recipe", recipeSchema);
