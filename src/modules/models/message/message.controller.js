import Message from "./message.model.js";
import Chat from "../../chat/chat.model.js"; // Chat model ko update karne ke liye
import { successResponse, errorResponse } from "../../../utils/response.js";
import { io } from "../../../../server.js"; // Server file se io instance import kiya

// ================= GET ALL MESSAGES =================
export const getMessages = async (req, res) => {
  console.log("📥 [getMessages] API Hit hogayi hai...");
  
  try {
    const { chatId } = req.params;
    console.log(`🔍 [getMessages] ChatID: ${chatId} ke liye messages dhund rahe hain...`);

    // Database se messages nikalna aur sender ki details populate karna
    const messages = await Message.find({ chatId })
      .populate("sender", "email username")
      .sort({ createdAt: 1 }); // Purane messages upar, naye niche

    console.log(`✅ [getMessages] Kul ${messages.length} messages mil gaye.`);
    
    // Success response wapas bhejna
    return successResponse(res, "Messages fetched successfully", messages);
  } catch (err) {
    console.error("❌ [getMessages] Error:", err.message);
    return errorResponse(res, "Failed to fetch messages", 500);
  }
};

// ================= SEND A NEW MESSAGE =================
export const sendMessage = async (req, res) => {
  console.log("📤 [sendMessage] Naya message bheja ja raha hai...");

  try {
    const { chatId, text } = req.body; // Body se data nikaala
    const senderId = req.user.userId; // Middleware se user ki ID li

    console.log(`📝 [sendMessage] Sender: ${senderId}, Chat: ${chatId}, Text: ${text}`);

    // Basic Validation
    if (!text || !chatId) {
      console.log("⚠️ [sendMessage] Validation Fail: Text ya ChatId missing hai.");
      return errorResponse(res, "ChatId and text are required", 400);
    }

    // 1. Database mein message save karna
    console.log("💾 [sendMessage] Message ko DB mein save kar rahe hain...");
    const newMessage = await Message.create({
      chatId,
      sender: senderId,
      text,
    });

    // 2. Sender details populate karna taaki frontend ko poora object mile
    console.log("👤 [sendMessage] Sender details populate ho rahi hain...");
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "email username");

    // 3. Chat model mein 'lastMessage' update karna (Chat list UI ke liye)
    console.log("🔄 [sendMessage] Chat model ka lastMessage update ho raha hai...");
    await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

    // 4. 🔥 SOCKET.IO: Real-time trigger
    console.log(`⚡ [sendMessage] Room ${chatId} mein real-time emit kar rahe hain...`);
    // 'io.to(chatId)' ka matlab hai sirf us chat room ke users ko dikhega
    io.to(chatId).emit("message_received", populatedMessage);

    console.log("✅ [sendMessage] Message successfully bhej diya gaya aur emit ho gaya.");

    // Final response to the sender
    return successResponse(res, "Message sent", populatedMessage);
  } catch (err) {
    console.error("❌ [sendMessage] Error:", err.message);
    return errorResponse(res, "Failed to send message", 500);
  }
};