import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    recipe:{
        type: Schema.Types.ObjectId,
        ref: "Recipe"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

export const Like = mongoose.model("Like", likeSchema)