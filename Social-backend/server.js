const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");

// CONFIG
const connectDB = require("./config/db");
const connectRedis = require("./config/redis");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const communityRoutes = require("./routes/communityRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const voteRoutes = require("./routes/voteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");

// SOCKET HANDLER
const socketHandler = require("./sockets/socketHandler");

// LOAD ENV
dotenv.config();

// CONNECT DATABASE
connectDB();

// CONNECT REDIS
connectRedis();

const app = express();
const server = http.createServer(app);

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// SERVE UPLOADED IMAGES
app.use("/uploads", express.static("uploads"));

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("API Running...");
});

// ── API ROUTES ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

// ── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server Error" });
});

// ── START SERVER ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
