import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { connectDatabase } from "./config/database.js";
import uploadsRouter from "./routes/uploads.js";
import usersRouter from "./routes/users.js";
import postsRouter from "./routes/posts.js";
import connectionsRouter from "./routes/connections.js";
import notificationsRouter from "./routes/notifications.js";
dotenv.config();
const app = express();
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			"script-src": ["'self'", "https://www.gstatic.com"],
			"connect-src": ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.googleapis.com", "https://api.cloudinary.com"]
		}
	}
}));
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.resolve(process.cwd(), "public")));
app.get("/api/health", (_request, response) => response.json({ status: "ok", service: "skillcircle-api" }));
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/connections", connectionsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/uploads", uploadsRouter);
app.use((error, _request, response, _next) => response.status(500).json({ error: error.message || "Internal server error" }));
export { app, connectDatabase };
