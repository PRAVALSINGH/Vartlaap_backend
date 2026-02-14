import redis from "../../redis/redis-client.js";
import User from "./user.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

/* ================= MY PROFILE ================= */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Redis se online / last seen
    const isOnline = await redis.get(`user:online:${userId}`);
    const lastSeen = await redis.get(`user:lastseen:${userId}`);

    return successResponse(res, "Profile fetched", {
      user,
      online: !!isOnline,
      lastSeen
    });
  } catch (err) {
    return errorResponse(res, "Failed to fetch profile", 500);
  }
};

/* ================= ALL USERS ================= */
export const getAllUsers = async (req, res) => {
  try {
    const myId = req.user.userId;

    const users = await User.find({ _id: { $ne: myId } })
      .select("email createdAt");

    return successResponse(res, "Users list", users);
  } catch (err) {
    return errorResponse(res, "Failed to fetch users", 500);
  }
};

// ------------------------------------------------

export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return successResponse(res, "Users fetched", []);
    }

    const users = await User.find({
      username: { $regex: keyword, $options: "i" }
    }).select("_id username email");

    return successResponse(res, "Users fetched", users);
  } catch (err) {
    return errorResponse(res, "Search failed", 500);
  }
};
