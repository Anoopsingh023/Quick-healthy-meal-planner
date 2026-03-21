import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const imageSchema = new mongoose.Schema(
  {
    imageFile: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    caption: {
      type: String,
    },
    // ⭐ Fast UI rendering (avoid counting likes every time)
    // likesCount: {
    //   type: Number,
    //   default: 0,
    // },
    // // ⭐ Fast UI rendering (avoid counting comment every time)
    // commentCount: {
    //   type: Number,
    //   default: 0,
    // },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

imageSchema.plugin(mongooseAggregatePaginate);

export const Image = mongoose.model("Image", imageSchema);
