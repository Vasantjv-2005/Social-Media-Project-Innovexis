const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUserById,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

// GET /api/users/profile — current logged-in user
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected Route Working",
    user: req.user,
  });
});

// GET /api/users — all users (protected)
router.get("/", protect, getAllUsers);

// GET /api/users/:id — user by id (protected)
router.get("/:id", protect, getUserById);

module.exports = router;
