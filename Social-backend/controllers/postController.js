const Post = require("../models/Post");

// CREATE POST
// Accepts multipart/form-data (title, content, community) + optional image file
const createPost = async (req, res) => {
  try {
    const { title, content, community } = req.body;

    // If a file was uploaded via multer, build a URL path to it
    // req.file is set by upload.single("image") middleware
    let imageUrl = "";
    if (req.file) {
      // Serve as /uploads/<filename> — the static route is set in server.js
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      title,
      content: content || "",
      image: imageUrl,
      community,
      author: req.user._id,
    });

    // Return the post with populated author and community so the frontend
    // can display it immediately without a second fetch
    const populated = await Post.findById(post._id)
      .populate("author", "username email")
      .populate("community", "name");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username email")
      .populate("community", "name");

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPost,
  getPosts,
};
