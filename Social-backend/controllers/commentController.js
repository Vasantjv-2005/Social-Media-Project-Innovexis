const Comment = require("../models/Comment");

// CREATE COMMENT
const createComment = async (req, res) => {
  try {
    const { content, post } = req.body;

    const comment = await Comment.create({
      content,
      post,
      user: req.user._id,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET COMMENTS OF POST
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
    }).populate("user", "username email");

    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getComments,
};