import express from "express";
import cors from "cors";
import authRoutes from "./src/modules/auth/auth.routes.js";
import userRoutes from "./src/modules/user/user.routes.js";
import chatRoutes from "./src/modules/chat/chat.routes.js";
import messageRoutes from "./src/modules/models/message/message.routes.js"; // Path confirm kar lein



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
export default app;
