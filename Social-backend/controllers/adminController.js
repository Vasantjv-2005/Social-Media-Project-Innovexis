const User = require("../models/User");
const Post = require("../models/Post");
const Community = require("../models/Community");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalCommunities = await Community.countDocuments();

    res.status(200).json({
      totalUsers,
      totalPosts,
      totalCommunities,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};