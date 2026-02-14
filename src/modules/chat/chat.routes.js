import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import {
  accessChat,
  fetchMyChats
} from "./chat.controller.js";

const router = express.Router();

router.post("/", authMiddleware, accessChat);
router.get("/", authMiddleware, fetchMyChats);

export default router;
