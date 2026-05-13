const cron = require("node-cron");

const startCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🧹 Running cleanup job...");

      // Future cleanup logic here
      // Example:
      // delete old notifications
      // remove expired sessions
      // clear unused uploads

      console.log("✅ Cleanup completed");
    } catch (error) {
      console.log("❌ Cleanup Job Error:", error.message);
    }
  });
};

module.exports = startCleanupJob;