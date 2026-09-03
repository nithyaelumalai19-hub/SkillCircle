import { Router } from "express";
import { cloudinary } from "../config/cloudinary.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/signature", requireAuth, (_request, response) => {
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME)
        return response.status(503).json({ error: "Cloudinary is not configured" });
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "skillcircle";
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
    return response.json({ timestamp, folder, signature, cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY });
});
export default router;
