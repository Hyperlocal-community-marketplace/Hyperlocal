require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const conversationRoutes = require("./routes/conversation");
const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const messageRoutes = require("./routes/message");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handling
const pool = require("./db/db");
io.on("connection", (socket) => {
  socket.on("join-conversation", (conversationId) => {
    socket.join(String(conversationId));
  });

  socket.on("send-message", async (data) => {
    try {
      const { conversationId, sender, text, senderRole } = data;
      
      // Validate required fields
      if (!conversationId || !sender || !text || !text.trim()) {
        socket.emit("error", { message: "Missing required fields: conversationId, sender, or text" });
        return;
      }
      
      const convId = parseInt(conversationId, 10);
      const senderId = parseInt(sender, 10);
      
      if (isNaN(convId) || isNaN(senderId)) {
        socket.emit("error", { message: "Invalid conversationId or sender ID" });
        return;
      }
      
      // Verify conversation exists and sender is part of it
      const [conversations] = await pool.query(
        "SELECT * FROM CONVERSATION WHERE id = ? AND (userId = ? OR sellerId = ?)",
        [convId, senderId, senderId]
      );
      
      if (conversations.length === 0) {
        socket.emit("error", { message: "Unauthorized: You are not part of this conversation" });
        return;
      }
      
      // Determine sender role if not provided
      let role = senderRole;
      if (!role || (role !== 'user' && role !== 'seller')) {
        const conv = conversations[0];
        role = conv.userId === senderId ? 'user' : 'seller';
      }
      
      // Insert message
      const [result] = await pool.query(
        "INSERT INTO MESSAGES (conversationId, sender, senderRole, text, createdAt) VALUES (?, ?, ?, ?, NOW())",
        [convId, senderId, role, text.trim()]
      );
      
      // Update conversation last message
      await pool.query(
        "UPDATE CONVERSATION SET lastMessage = ?, updatedAt = NOW() WHERE id = ?",
        [text.trim(), convId]
      );
      
      // Get the inserted message and broadcast it
      const [messages] = await pool.query("SELECT * FROM MESSAGES WHERE id = ?", [result.insertId]);
      if (messages.length > 0) {
        io.to(String(convId)).emit("receive-message", messages[0]);
      }
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("user-typing", {
      conversationId: data.conversationId,
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  socket.on("disconnect", () => {
    // User disconnected
  });
});

app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/conversation", conversationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack || err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message: message,
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
