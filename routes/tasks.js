const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all tasks (can be dynamic from DB later)
router.get("/", (req, res) => {
  const dailyTasks = [
    { id: 1, type: "daily", name: "Watch Short Video", coin: 10, spin: 1 }
  ];
  const specialTasks = [
    { id: 2, type: "special", name: "Join Telegram Channel", coin: 20, spin: 2 }
  ];
  res.json({ success: true, dailyTasks, specialTasks });
});

// Complete a task
router.post("/complete", async (req, res) => {
  try {
    const { telegramId, taskId } = req.body;
    const user = await User.findOne({ telegramId });
    if(!user) return res.status(404).json({ success: false, message: "User not found" });

    // Example: simple coin/spin assignment
    let reward = { coins: 0, spins: 0 };
    if(taskId == 1) reward = { coins: 10, spins: 1 };       // daily
    if(taskId == 2) reward = { coins: 20, spins: 2 };       // special

    user.coins += reward.coins;
    user.spins += reward.spins;
    await user.save();

    res.json({ success: true, reward, user });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
