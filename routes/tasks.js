// routes/tasks.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Reward user after watching ad
router.post("/reward", async (req, res) => {
  try {
    const { telegramId, coinsEarned } = req.body;

    if (!telegramId || !coinsEarned) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.coins += coinsEarned;
    await user.save();

    res.json({ success: true, coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
