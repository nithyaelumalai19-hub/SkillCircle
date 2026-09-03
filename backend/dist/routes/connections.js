import { Router } from "express";
import { Connection } from "../models/Connection.js";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/", requireAuth, async (request, response) => {
    const userId = request.user?.id;
    const connections = await Connection.find({ $or: [{ requester: userId }, { recipient: userId }] }).populate("requester recipient", "name profileImage college").lean();
    return response.json({ connections });
});
router.post("/:userId", requireAuth, async (request, response) => {
    const requester = request.user?.id;
    if (request.params.userId === requester)
        return response.status(400).json({ error: "You cannot connect with yourself" });
    const existing = await Connection.findOne({ $or: [{ requester, recipient: request.params.userId }, { requester: request.params.userId, recipient: requester }] });
    if (existing)
        return response.status(409).json({ error: "A connection already exists" });
    const connection = await Connection.create({ requester, recipient: request.params.userId });
    await Notification.create({ recipient: request.params.userId, actor: requester, type: "connection_request" });
    return response.status(201).json({ connection });
});
router.patch("/:id", requireAuth, async (request, response) => {
    const connection = await Connection.findById(request.params.id);
    if (!connection || connection.recipient.toString() !== request.user?.id)
        return response.status(404).json({ error: "Request not found" });
    const status = request.body.status === "accepted" ? "accepted" : "rejected";
    connection.status = status;
    await connection.save();
    if (status === "accepted")
        await Notification.create({ recipient: connection.requester, actor: request.user?.id, type: "connection_accepted" });
    return response.json({ connection });
});
router.delete("/:id", requireAuth, async (request, response) => {
    await Connection.findOneAndDelete({ _id: request.params.id, $or: [{ requester: request.user?.id }, { recipient: request.user?.id }] });
    return response.status(204).send();
});
export default router;
