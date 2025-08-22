const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Auto register/login
router.post("/login", async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: "Telegram ID missing" });
    }

    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({ telegramId, firstName, lastName, username });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
