const Vote = require("../models/Vote");
const Post = require("../models/Post");

const handleVote = async (
  userId,
  postId,
  voteType
) => {
  try {
    const existingVote =
      await Vote.findOne({
        user: userId,
        post: postId,
      });

    if (existingVote) {
      existingVote.voteType = voteType;
      await existingVote.save();
    } else {
      await Vote.create({
        user: userId,
        post: postId,
        voteType,
      });
    }

    const post = await Post.findById(postId);

    const upvotes = await Vote.countDocuments({
      post: postId,
      voteType: "upvote",
    });

    const downvotes =
      await Vote.countDocuments({
        post: postId,
        voteType: "downvote",
      });

    post.upvotes = upvotes;
    post.downvotes = downvotes;

    await post.save();

    return post;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  handleVote,
};