const express = require("express");

const router = express.Router();

const {
  createComment,
  getComments,
} = require("../controllers/commentController");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post("/", protect, createComment);

router.get("/:postId", getComments);

module.exports = router;