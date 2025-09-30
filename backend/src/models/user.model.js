import mongoose,{Schema} from "mongoose";

const userSchema = new Schema(
    {
        userName :{
            type:String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            required : true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        avatar: {
            type: String,
            required: true
        },
        refreshToken: {
            type: String,
        }
    },{timestamps: true}
)

export const User = mongoose.model("User", userSchema)