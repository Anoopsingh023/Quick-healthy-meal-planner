import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    // ⭐ Dynamic reference (Comment / Image / Recipe)
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
      index: true
    },

    targetType: {
      type: String,
      required: true,
      enum: ["Comment", "Image", "Recipe"],
      index: true
    },

    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate likes (VERY IMPORTANT)
likeSchema.index(
  { target: 1, targetType: 1, likedBy: 1 },
  { unique: true }
);

// 🔥 Fast queries (count, list)
likeSchema.index({ target: 1, targetType: 1 });

export const Like = mongoose.model("Like", likeSchema);