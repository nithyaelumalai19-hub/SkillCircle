import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
let connectionPromise;
export function connectDatabase() {
    if (!process.env.MONGODB_URI)
        throw new Error("MONGODB_URI is not configured");
    connectionPromise ??= mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    return connectionPromise;
}
