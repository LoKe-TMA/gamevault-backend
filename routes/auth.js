const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { telegramId, username, first_name, last_name, photo_url } = req.body;

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, username, first_name, last_name, photo_url, coin_balance: 0 });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/auth/profile/:telegramId
router.get("/profile/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
