import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    isGroup: {
      type: Boolean,
      default: false
    },
    lastMessage: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
