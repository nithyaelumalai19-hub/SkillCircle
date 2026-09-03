import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", requireAuth, async (request, response) => response.json({ notifications: await Notification.find({ recipient: request.user?.id }).sort({ createdAt: -1 }).limit(50).populate("actor", "name profileImage").lean() }));
router.patch("/:id/read", requireAuth, async (request, response) => response.json({ notification: await Notification.findOneAndUpdate({ _id: request.params.id, recipient: request.user?.id }, { read: true }, { new: true }) }));
export default router;
