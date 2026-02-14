import express from "express";
import { getMessages, sendMessage } from "./message.controller.js";
import authMiddleware from "../../../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:chatId", authMiddleware, getMessages); // GET /api/message/:chatId
router.post("/", authMiddleware, sendMessage);      // POST /api/message

export default router;