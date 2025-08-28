const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Auto-register/login
router.post("/register", async (req, res) => {
  const { telegramId, username, referrerId } = req.body;
  try {
    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, username, referrerId });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user info
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
