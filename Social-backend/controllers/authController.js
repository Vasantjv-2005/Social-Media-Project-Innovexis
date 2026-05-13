const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
    } = req.body;

    // Check user
    const userExists =
      await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 10), // Hash password manually
    });

    // Response
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// Login User
const loginUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({ email });

    if (
      user &&
      (await bcrypt.compare(
        password,
        user.password
      ))
    ) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({
        message:
          "Invalid email or password",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};