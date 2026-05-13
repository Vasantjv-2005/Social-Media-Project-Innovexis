const express = require("express");
const router = express.Router();

const {
  sendMessage,
  getConversation,
  getConversations,
  getUsersForChat,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

// All message routes require authentication
router.use(protect);

// GET  /api/messages/users              — all users available to chat with
router.get("/users", getUsersForChat);

// GET  /api/messages/conversations      — my inbox (one entry per partner)
router.get("/conversations", getConversations);

// GET  /api/messages/conversation/:id   — full message thread with one user
router.get("/conversation/:otherUserId", getConversation);

// POST /api/messages                    — send a message
router.post("/", sendMessage);

module.exports = router;
