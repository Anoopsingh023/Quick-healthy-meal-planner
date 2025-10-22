import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNo: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      dietPreference: {
        type: String,
        enum: ["Veg", "Vegan", "Non-Veg", "Keto", "Any"],
        default: "Any",
      },
      cookingSkill: {
        type: String,
        enum: ["Beginner", "Intermediate", "Expert"],
        default: "Beginner",
      },
      allergies: [{ type: String }], // e.g., ["Peanuts", "Gluten"]
    },
    preferences: {
      budgetRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 200 },
      }, // ₹
      cuisines: [{ type: String }], // e.g., ["Indian", "Italian"]
    },
    gamification: {
      streak: { type: Number, default: 0 }, // daily cooking streak
      badges: [{ type: String }], // ["Budget Saver", "Zero Waste Cook"]
      points: { type: Number, default: 0 },
      lastCookedAt: { type: Date }, // when user last marked a cook
      cookedCount: { type: Number, default: 0 },
    },
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    shoppingList: [{ type: String }], // items to buy
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName: this.userName,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
