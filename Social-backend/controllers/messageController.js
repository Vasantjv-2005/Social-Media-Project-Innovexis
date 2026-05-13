const Message = require("../models/Message");
const User = require("../models/User");

// ─── Send a message ───────────────────────────────────────────────────────────
// POST /api/messages
// Body: { receiverId, content }
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({ message: "Cannot send a message to yourself" });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId).select("_id username");
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    // Populate sender info for the response
    const populated = await Message.findById(message._id)
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get conversation between two users ──────────────────────────────────────
// GET /api/messages/conversation/:otherUserId
const getConversation = async (req, res) => {
  try {
    const myId = req.user._id;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username avatar")
      .populate("receiver", "username avatar");

    // Mark messages sent to me as read
    await Message.updateMany(
      { sender: otherUserId, receiver: myId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all conversations (inbox) ───────────────────────────────────────────
// GET /api/messages/conversations
// Returns one entry per unique conversation partner with the latest message
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Find all messages where I am sender or receiver
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "_id username avatar")
      .populate("receiver", "_id username avatar");

    // Build a map: otherUserId → latest message
    const conversationMap = new Map();

    for (const msg of messages) {
      const other =
        String(msg.sender._id) === String(myId) ? msg.receiver : msg.sender;
      const otherId = String(other._id);

      if (!conversationMap.has(otherId)) {
        const unreadCount = await Message.countDocuments({
          sender: other._id,
          receiver: myId,
          read: false,
        });

        conversationMap.set(otherId, {
          user: other,
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get all users (to start a new conversation) ─────────────────────────────
// GET /api/messages/users
const getUsersForChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const users = await User.find({ _id: { $ne: myId } }).select(
      "_id username avatar bio"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUsersForChat,
};
