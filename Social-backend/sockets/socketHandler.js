// Maps userId (string) → socket.id so we can target specific users
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("⚡ Socket connected:", socket.id);

    // ── Auth / presence ──────────────────────────────────────────────────────
    // Client emits this right after connecting, passing their userId
    socket.on("userOnline", (userId) => {
      if (!userId) return;
      onlineUsers.set(String(userId), socket.id);
      socket.join(String(userId)); // personal room = userId
      // Broadcast updated online list to everyone
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`✅ User online: ${userId} (socket ${socket.id})`);
    });

    // ── Direct messaging ─────────────────────────────────────────────────────
    // Client emits this AFTER the REST call has already saved the message to DB.
    // We just forward the saved message object to the receiver in real-time.
    socket.on("sendMessage", (message) => {
      const receiverId = String(message.receiver?._id ?? message.receiver);
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        // Receiver is online — push directly to their socket
        io.to(receiverSocketId).emit("receiveMessage", message);
      }
      // Also echo back to sender's other tabs/devices
      const senderId = String(message.sender?._id ?? message.sender);
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId && senderSocketId !== socket.id) {
        io.to(senderSocketId).emit("receiveMessage", message);
      }
    });

    // ── Typing indicators ────────────────────────────────────────────────────
    socket.on("typing", ({ toUserId, fromUserId }) => {
      const receiverSocketId = onlineUsers.get(String(toUserId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { fromUserId });
      }
    });

    socket.on("stopTyping", ({ toUserId, fromUserId }) => {
      const receiverSocketId = onlineUsers.get(String(toUserId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", { fromUserId });
      }
    });

    // ── Notifications ────────────────────────────────────────────────────────
    socket.on("sendNotification", (data) => {
      io.to(String(data.userId)).emit("receiveNotification", {
        message: data.message,
      });
    });

    // ── Real-time post broadcast ─────────────────────────────────────────────
    socket.on("newPost", (post) => {
      io.emit("postCreated", post);
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      // Remove from online map
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          io.emit("onlineUsers", Array.from(onlineUsers.keys()));
          console.log(`❌ User offline: ${userId}`);
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
