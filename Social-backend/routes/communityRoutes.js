const express = require("express");

const router = express.Router();

const {
  createCommunity,
  getCommunities,
} = require("../controllers/communityController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/", protect, createCommunity);

router.get("/", getCommunities);

module.exports = router;