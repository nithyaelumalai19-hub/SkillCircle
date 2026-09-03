import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
const editableFields = ["name", "username", "bio", "location", "college", "degree", "graduationYear", "profileImage", "coverImage", "skills", "interests", "projects"];
router.get("/me", requireAuth, async (request, response) => {
    const user = await User.findById(request.user?.id).select("-__v");
    return response.json({ user });
});
router.patch("/me", requireAuth, async (request, response) => {
    const updates = Object.fromEntries(Object.entries(request.body).filter(([key]) => editableFields.includes(key)));
    const user = await User.findByIdAndUpdate(request.user?.id, updates, { new: true, runValidators: true }).select("-__v");
    return response.json({ user });
});
router.get("/discover", requireAuth, async (request, response) => {
    const query = String(request.query.q ?? "").trim();
    const filter = query ? { $text: { $search: query }, _id: { $ne: request.user?.id } } : { _id: { $ne: request.user?.id } };
    const users = await User.find(filter).select("name username profileImage bio college degree skills interests projects").limit(30).lean();
    return response.json({ users });
});
router.post("/me/ai-bio", requireAuth, async (request, response) => {
    if (!process.env.GROQ_API_KEY)
        return response.status(503).json({ error: "Groq is not configured" });
    const user = await User.findById(request.user?.id).lean();
    if (!user)
        return response.status(404).json({ error: "User not found" });
    const prompt = `Write a concise, professional student networking bio in first person (maximum 60 words). Use only these details: college: ${user.college}; skills: ${user.skills.join(", ")}; interests: ${user.interests.join(", ")}; projects: ${user.projects.join(", ")}. Return only the bio.`;
    const result = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.GROQ_MODEL ?? "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 120 }) });
    if (!result.ok)
        return response.status(502).json({ error: "Groq could not generate a bio" });
    const data = await result.json();
    return response.json({ bio: data.choices?.[0]?.message?.content?.trim() ?? "" });
});
router.get("/:id", async (request, response) => {
    const user = await User.findById(request.params.id).select("-email -firebaseUid -__v");
    if (!user)
        return response.status(404).json({ error: "User not found" });
    return response.json({ user });
});
export default router;
