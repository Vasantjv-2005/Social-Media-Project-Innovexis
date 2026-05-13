const Notification = require("../models/Notification");

const createNotification = async (
  userId,
  message
) => {
  try {
    const notification =
      await Notification.create({
        user: userId,
        message,
      });

    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createNotification,
};