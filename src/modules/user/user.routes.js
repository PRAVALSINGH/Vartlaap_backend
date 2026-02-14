import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import {
  getMyProfile,
  getAllUsers,
  searchUsers
} from "./user.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.get("/all", authMiddleware, getAllUsers);
router.get("/search", authMiddleware, searchUsers);

export default router;
