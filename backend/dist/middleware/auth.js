import { getFirebaseAuth } from "../config/firebase.js";
import { User } from "../models/User.js";
export async function requireAuth(request, response, next) {
    try {
        const header = request.headers.authorization;
        if (!header?.startsWith("Bearer "))
            return response.status(401).json({ error: "Authentication required" });
        const decoded = await getFirebaseAuth().verifyIdToken(header.slice(7));
        const user = await User.findOneAndUpdate({ firebaseUid: decoded.uid }, {
            $setOnInsert: { firebaseUid: decoded.uid, name: decoded.name ?? "SkillCircle member", email: decoded.email ?? "" }
        }, { new: true, upsert: true, setDefaultsOnInsert: true });
        request.user = { id: user.id, firebaseUid: decoded.uid, email: decoded.email ?? user.email };
        return next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown authentication error";
        console.error("Firebase authentication failed:", message);
        if (message.includes("private key") || message.includes("credential") || message.includes("DECODER")) {
            return response.status(503).json({ error: "Firebase Admin credentials are invalid. Check FIREBASE_PRIVATE_KEY in .env" });
        }
        return response.status(401).json({ error: "Invalid or expired authentication token" });
    }
}
