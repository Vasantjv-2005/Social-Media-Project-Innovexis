const Community = require("../models/Community");

// CREATE COMMUNITY
const createCommunity = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCommunity = await Community.findOne({ name });

    if (existingCommunity) {
      return res.status(400).json({
        message: "Community already exists",
      });
    }

    const community = await Community.create({
      name,
      description,
      creator: req.user._id,
    });

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL COMMUNITIES
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("creator", "username email");

    res.json(communities);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
};