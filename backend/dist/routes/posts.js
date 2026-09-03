import { Router } from "express";
import { Types } from "mongoose";
import { Comment } from "../models/Comment.js";
import { Notification } from "../models/Notification.js";
import { Post } from "../models/Post.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const postView = () => Post.find().sort({ createdAt: -1 }).populate("author", "name profileImage college").lean();
router.get("/", requireAuth, async (_request, response) => response.json({ posts: await postView() }));
router.post("/", requireAuth, async (request, response) => {
    const text = String(request.body.text ?? "").trim();
    if (!text)
        return response.status(400).json({ error: "Post text is required" });
    const post = await Post.create({ author: request.user?.id, text, imageUrl: String(request.body.imageUrl ?? "") });
    return response.status(201).json({ post: await post.populate("author", "name profileImage college") });
});
router.patch("/:id", requireAuth, async (request, response) => {
    const post = await Post.findOneAndUpdate({ _id: request.params.id, author: request.user?.id }, { text: request.body.text, imageUrl: request.body.imageUrl }, { new: true, runValidators: true }).populate("author", "name profileImage college");
    return post ? response.json({ post }) : response.status(404).json({ error: "Post not found" });
});
router.delete("/:id", requireAuth, async (request, response) => {
    const post = await Post.findOneAndDelete({ _id: request.params.id, author: request.user?.id });
    if (!post)
        return response.status(404).json({ error: "Post not found" });
    await Comment.deleteMany({ post: post.id });
    return response.status(204).send();
});
router.post("/:id/like", requireAuth, async (request, response) => {
    const post = await Post.findById(request.params.id);
    if (!post)
        return response.status(404).json({ error: "Post not found" });
    const userId = request.user.id;
    const liked = post.likes.some((id) => id.toString() === userId);
    post.likes = liked ? post.likes.filter((id) => id.toString() !== userId) : [...post.likes, new Types.ObjectId(userId)];
    await post.save();
    if (!liked && post.author.toString() !== userId)
        await Notification.create({ recipient: post.author, actor: userId, type: "like", post: post.id });
    return response.json({ liked: !liked, likeCount: post.likes.length });
});
router.get("/:id/comments", requireAuth, async (request, response) => response.json({ comments: await Comment.find({ post: request.params.id }).sort({ createdAt: 1 }).populate("author", "name profileImage").lean() }));
router.post("/:id/comments", requireAuth, async (request, response) => {
    const text = String(request.body.text ?? "").trim();
    const post = await Post.findById(request.params.id);
    if (!post || !text)
        return response.status(400).json({ error: "Post and comment text are required" });
    const comment = await Comment.create({ post: post.id, author: request.user?.id, text });
    if (post.author.toString() !== request.user?.id)
        await Notification.create({ recipient: post.author, actor: request.user?.id, type: "comment", post: post.id });
    return response.status(201).json({ comment: await comment.populate("author", "name profileImage") });
});
export default router;
