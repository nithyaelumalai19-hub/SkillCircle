import { model, Schema } from "mongoose";
const commentSchema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });
export const Comment = model("Comment", commentSchema);
