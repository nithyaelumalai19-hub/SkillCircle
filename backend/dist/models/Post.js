import { model, Schema } from "mongoose";
const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    imageUrl: { type: String, default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });
export const Post = model("Post", postSchema);
