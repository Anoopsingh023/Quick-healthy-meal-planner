import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// --------------------- SCHEMA ---------------------
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-z0-9_]+$/, "Username must be lowercase alphanumeric"],
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // 🔥 important
    },

    phoneNo: {
      type: String,
      required: function () {
        return !this.googleId; // 🔥 only required for normal users
      },
      match: [/^[6-9]\d{9}$/, "Invalid Indian phone number"],
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    avatar: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tokenVersion: {
      type: Number,
      default: 0, // 🔥 invalidate all sessions
    },

    // ---------------- PROFILE ----------------
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
      allergies: [
        {
          type: String,
          lowercase: true,
          trim: true,
        },
      ],
    },

    // ---------------- PREFERENCES ----------------
    preferences: {
      budgetRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 200 },
      },
      cuisines: [
        {
          type: String,
          lowercase: true,
          trim: true,
        },
      ],
    },

    // ---------------- GAMIFICATION ----------------
    gamification: {
      streak: { type: Number, default: 0 },
      badges: [{ type: String }],
      points: { type: Number, default: 0 },
      lastCookedAt: { type: Date },
      cookedCount: { type: Number, default: 0 },
    },

    // ---------------- RELATIONS ----------------
    savedRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
        index: true,
      },
    ],

    // ---------------- AUTH ----------------
    refreshToken: {
      type: String,
      select: false, // 🔥 hide
    },

    refreshTokenExpiry: {
      type: Date,
    },

    sessions: [
      {
        device: String,
        ip: String,
        lastActive: Date,
      },
    ],
  },
  { timestamps: true },
);

// --------------------- PASSWORD HASH ---------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// --------------------- METHODS ---------------------

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      tokenVersion: this.tokenVersion,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      tokenVersion: this.tokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
};

// --------------------- SECURITY ---------------------

userSchema.methods.incrementTokenVersion = async function () {
  this.tokenVersion += 1;
  await this.save();
};

export const User = mongoose.model("User", userSchema);
