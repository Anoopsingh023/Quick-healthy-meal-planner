import mongoose, {Schema} from "mongoose";

const followSchema = new Schema({
    chef: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    follower: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

export const Follow = mongoose.model("Follow", followSchema)