import "dotenv/config";
import http from "http"; // 1. Add this
import { Server } from "socket.io"; // 2. Add this
import app from "./app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// 3. HTTP Server banayein
const server = http.createServer(app);

// 4. Socket.io Initialize karein
const io = new Server(server, {
  cors: {
    origin: "*", // Live karte waqt yahan frontend URL dalna
    methods: ["GET", "POST"]
  }
});

// 5. Socket Logic
io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  // Jab user kisi chat room mein enter kare
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  // Message bhejne ka signal (Optional: Controller se bhi kar sakte hain)
  socket.on("new_message", (newMessageReceived) => {
    let chat = newMessageReceived.chatId;
    if (!chat) return console.log("Chat ID not defined");

    // Room mein maujood baaki users ko message bhejdo
    socket.in(chat).emit("message_received", newMessageReceived);
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected");
  });
});

const startServer = async () => {
  await connectDB();

  // 6. DHAYAN DEIN: Ab app.listen nahi, server.listen use karein
  server.listen(PORT, () => {
    console.log(`🚀 Real-time Server running on port ${PORT}`);
  });
};

startServer();

// 7. Is 'io' ko export karein taaki controller mein use ho sake
export { io };