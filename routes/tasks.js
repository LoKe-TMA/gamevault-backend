const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Complete task (reward user)
router.post("/complete", async (req, res) => {
  try {
    const { telegramId, taskId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const user = await User.findOneAndUpdate(
      { telegramId },
      { $inc: { coins: task.rewardCoins, spins: task.rewardSpins } },
      { new: true }
    );

    res.json({ success: true, user, reward: { coins: task.rewardCoins, spins: task.rewardSpins } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
