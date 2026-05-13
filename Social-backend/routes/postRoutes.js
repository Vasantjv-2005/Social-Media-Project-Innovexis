const express = require("express");

const router = express.Router();

const {
  createPost,
  getPosts,
} = require("../controllers/postController");

const {
  protect,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

// POST /api/posts — multipart/form-data with optional image field
router.post("/", protect, upload.single("image"), createPost);

router.get("/", getPosts);

module.exports = router;
