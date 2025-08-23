const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get profile
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Add coins (reward from Ads, tasks, etc.)
router.post("/add-coins", async (req, res) => {
  try {
    const { telegramId, coins } = req.body;
    const user = await User.findOneAndUpdate(
      { telegramId },
      { $inc: { coins } },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
