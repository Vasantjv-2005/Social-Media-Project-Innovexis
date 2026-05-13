const Redis = require("ioredis");

const redis = new Redis(
  process.env.REDIS_URL
);

const connectRedis = async () => {
  try {
    redis.on("connect", () => {
      console.log("✅ Redis Connected");
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectRedis;