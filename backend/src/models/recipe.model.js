import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    // ---------------- BASIC INFO ----------------
    title: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },

    // 🔥 Combined searchable text (for fallback search)
    searchText: {
      type: String,
      index: "text",
    },

    // ---------------- INGREDIENTS ----------------
    ingredients: [
      {
        name: { type: String, required: true },
        quantity: { type: String },
        optional: { type: Boolean, default: false },
      },
    ],

    // ---------------- STEPS ----------------
    steps: [
      {
        stepNumber: Number,
        instruction: { type: String, required: true },
        time: { type: Number },
      },
    ],

    // ---------------- METADATA ----------------
    metadata: {
      cookingTime: { type: Number, required: true },

      difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
        default: "Beginner",
      },

      cuisine: { type: String },

      dietType: {
        type: String,
        enum: ["Veg", "Vegan", "Non-Veg", "Any"],
        default: "Any",
      },

      foodType: [{ type: String }],

      costEstimate: { type: Number },

      calories: { type: Number },
    },

    // ---------------- TAGS ----------------
    tags: [{ type: String }],

    // ---------------- VECTOR SEARCH ----------------
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 768;
        },
        message: "Embedding must be 768 dimensions",
      },
    },

    // ---------------- RANKING ----------------
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },

      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
    },

    // 🔥 Precomputed scores (FAST sorting)
    popularityScore: {
      type: Number,
      default: 0,
      index: true,
    },

    qualityScore: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ---------------- SOURCE ----------------
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    source: {
      type: String,
      default: "Manual",
    },

    // ---------------- CACHE ----------------
    hash: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    cacheKey: {
      type: String,
      index: true,
    },

    expiresAt: {
      type: Date,
      index: { expires: 0 }, // TTL
    },
  },
  { timestamps: true },
);

// ================= INDEXES =================

// 🔥 Text search fallback
recipeSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  "ingredients.name": "text",
});


// 🔥 Filtering indexes
recipeSchema.index({ "metadata.cuisine": 1, "metadata.dietType": 1 });
recipeSchema.index({ "metadata.costEstimate": 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ popularityScore: -1 });

// ================= PRE-SAVE HOOK =================
recipeSchema.pre("save", function (next) {
  // Normalize text fields
  if (this.metadata?.foodType) {
    this.metadata.foodType = this.metadata.foodType.map((t) => t.toLowerCase());
  }

  if (this.tags) {
    this.tags = this.tags.map((t) => t.toLowerCase());
  }

  if (this.metadata?.cuisine) {
    this.metadata.cuisine = this.metadata.cuisine.toLowerCase();
  }

  // 🔥 Build searchable text
  this.searchText = `
    ${this.title}
    ${this.description || ""}
    ${(this.tags || []).join(" ")}
    ${this.metadata?.cuisine || ""}
    ${(this.ingredients || []).map((i) => i.name).join(" ")}
  `;

  // 🔥 Compute popularity score
  this.popularityScore =
    (this.stats?.likes || 0) * 0.3 +
    (this.stats?.saves || 0) * 0.4 +
    (this.stats?.views || 0) * 0.1;

  // 🔥 Compute quality score
  this.qualityScore =
    (this.stats?.rating || 0) * 0.7 +
    Math.log10((this.stats?.ratingCount || 0) + 1) * 0.3;

  next();
});

export const Recipe = mongoose.model("Recipe", recipeSchema);
