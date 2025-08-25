const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/tasks/watch-ad
router.post("/watch-ad", async (req, res) => {
  try {
    const { telegramId } = req.body;
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Example: reward +100 coins
    user.coin_balance += 100;
    await user.save();

    res.json({ success: true, new_balance: user.coin_balance });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
