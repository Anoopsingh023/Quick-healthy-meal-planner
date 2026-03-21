import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    // Post reference
    imagePost: {
      type: Schema.Types.ObjectId,
      ref: "Image",
      required: true,
      index: true
    },

    // ⭐ For replies (Instagram-style threads)
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true
    },

    // ⭐ Performance optimization
    repliesCount: {
      type: Number,
      default: 0
    },

    // ⭐ Fast UI rendering (avoid counting likes every time)
    likesCount: {
      type: Number,
      default: 0
    },

    // Optional features
    isEdited: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// 🔥 Indexes for performance
commentSchema.index({ imagePost: 1, parentComment: 1, createdAt: -1 });

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);