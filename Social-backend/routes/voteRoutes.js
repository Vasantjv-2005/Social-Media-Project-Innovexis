const express = require("express");
const router = express.Router();

const {
  upvotePost,
  downvotePost,
  getUserVote,
  getUserVotesBatch,
} = require("../controllers/voteController");

const { protect } = require("../middleware/authMiddleware");

// All vote routes require authentication
router.use(protect);

// POST /api/votes/upvote/:postId   — upvote (or toggle off / switch from downvote)
router.post("/upvote/:postId", upvotePost);

// POST /api/votes/downvote/:postId — downvote (or toggle off / switch from upvote)
router.post("/downvote/:postId", downvotePost);

// GET  /api/votes/user/:postId     — get current user's vote on one post
router.get("/user/:postId", getUserVote);

// POST /api/votes/user/batch       — get current user's votes on many posts at once
router.post("/user/batch", getUserVotesBatch);

module.exports = router;
