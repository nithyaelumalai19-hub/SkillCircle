import dotenv from "dotenv";
import { app, connectDatabase } from "./app.js";
dotenv.config();
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`SkillCircle API listening on http://localhost:${port}`));
connectDatabase().then(() => console.log("MongoDB connected")).catch((error) => {
    console.error("Could not connect to MongoDB:", error.message);
});
