import Chat from "./chat.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

/* ================= CREATE / GET CHAT ================= */
export const accessChat = async (req, res) => {
  try {
    const myId = req.user.userId;
    const { userId } = req.body; // jis se chat karni hai

    if (!userId) {
      return errorResponse(res, "UserId required", 400);
    }

    // 🔍 Check existing chat
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [myId, userId] }
    }).populate("participants", "email");

    if (chat) {
      return successResponse(res, "Chat fetched", chat);
    }

    // 🆕 Create new chat
    const newChat = await Chat.create({
      participants: [myId, userId]
    });

    const fullChat = await Chat.findById(newChat._id)
      .populate("participants", "email");

    return successResponse(res, "Chat created", fullChat);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Chat access failed", 500);
  }
};

/* ================= MY CHATS ================= */
export const fetchMyChats = async (req, res) => {
  try {
    const myId = req.user.userId;

    const chats = await Chat.find({
      participants: myId
    })
      .populate("participants", "email")
      .sort({ updatedAt: -1 });

    return successResponse(res, "Chats fetched", chats);
  } catch (err) {
    return errorResponse(res, "Failed to fetch chats", 500);
  }
};
