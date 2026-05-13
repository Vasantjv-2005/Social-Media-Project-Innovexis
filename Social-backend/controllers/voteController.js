const Vote = require("../models/Vote");
const Post = require("../models/Post");
const mongoose = require("mongoose");

// ─── Helper: recount votes, update post, return populated post ────────────────
const recountAndReturn = async (postId) => {
  const id = new mongoose.Types.ObjectId(String(postId));

  const upvotes = await Vote.countDocuments({ post: id, voteType: "upvote" });
  const downvotes = await Vote.countDocuments({ post: id, voteType: "downvote" });

  // Update the post counts
  await Post.findByIdAndUpdate(id, { upvotes, downvotes });

  // Fetch fresh populated post
  const post = await Post.findById(id)
    .populate("author", "username email avatar")
    .populate("community", "name");

  return post;
};

// ─── POST /api/votes/upvote/:postId ──────────────────────────────────────────
exports.upvotePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = String(req.params.postId);

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    // Verify post exists
    const postExists = await Post.findById(postId).select("_id");
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await Vote.findOne({ user: userId, post: postId });

    if (!existing) {
      await Vote.create({ user: userId, post: postId, voteType: "upvote" });
    } else if (existing.voteType === "upvote") {
      await Vote.deleteOne({ _id: existing._id });
    } else {
      existing.voteType = "upvote";
      await existing.save();
    }

    const post = await recountAndReturn(postId);
    const currentVote = await Vote.findOne({ user: userId, post: postId });

    return res.status(200).json({
      post,
      userVote: currentVote ? currentVote.voteType : null,
    });
  } catch (error) {
    console.error("upvotePost error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/votes/downvote/:postId ────────────────────────────────────────
exports.downvotePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = String(req.params.postId);

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postExists = await Post.findById(postId).select("_id");
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await Vote.findOne({ user: userId, post: postId });

    if (!existing) {
      await Vote.create({ user: userId, post: postId, voteType: "downvote" });
    } else if (existing.voteType === "downvote") {
      await Vote.deleteOne({ _id: existing._id });
    } else {
      existing.voteType = "downvote";
      await existing.save();
    }

    const post = await recountAndReturn(postId);
    const currentVote = await Vote.findOne({ user: userId, post: postId });

    return res.status(200).json({
      post,
      userVote: currentVote ? currentVote.voteType : null,
    });
  } catch (error) {
    console.error("downvotePost error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/votes/user/:postId ─────────────────────────────────────────────
exports.getUserVote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const vote = await Vote.findOne({ user: userId, post: postId });
    return res.status(200).json({ userVote: vote ? vote.voteType : null });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/votes/user/batch ──────────────────────────────────────────────
exports.getUserVotesBatch = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postIds } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(200).json({});
    }

    const votes = await Vote.find({
      user: userId,
      post: { $in: postIds },
    });

    const voteMap = {};
    for (const v of votes) {
      voteMap[String(v.post)] = v.voteType;
    }

    return res.status(200).json(voteMap);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
