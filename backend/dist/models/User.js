import { model, Schema } from "mongoose";
const userSchema = new Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true, maxlength: 30 },
    email: { type: String, required: true, lowercase: true, trim: true },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    location: { type: String, default: "", maxlength: 100 },
    college: { type: String, default: "", maxlength: 160 },
    degree: { type: String, default: "", maxlength: 120 },
    graduationYear: { type: Number, min: 1900, max: 2200 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    projects: { type: [String], default: [] }
}, { timestamps: true });
userSchema.index({ name: "text", username: "text", college: "text", skills: "text", interests: "text" });
export const User = model("User", userSchema);
