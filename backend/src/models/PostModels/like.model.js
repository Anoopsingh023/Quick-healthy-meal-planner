import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    imagePost: {
        type: Schema.Types.ObjectId,
        ref: "Image"
    },
    recipe: {
        type: Schema.Types.ObjectId,
        ref: "recipe"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, {timestamps: true})

export const Like = mongoose.model("Like", likeSchema)