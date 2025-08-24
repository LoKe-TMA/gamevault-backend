const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");

// Get all special tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Complete a task
router.post("/complete", async (req, res) => {
  try {
    const { telegramId, taskId } = req.body;
    const user = await User.findOne({ telegramId });
    const task = await Task.findById(taskId);

    if (!user || !task) return res.json({ success: false, message: "Invalid task/user" });

    if (user.completedTasks.includes(taskId)) {
      return res.json({ success: false, message: "Task already completed" });
    }

    user.coins += task.reward;
    user.completedTasks.push(taskId);
    await user.save();

    res.json({ success: true, reward: task.reward, newBalance: user.coins });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
