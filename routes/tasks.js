const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SpecialTask = require("../models/SpecialTask");

// Daily task config
const DAILY_TASK_ID = 1;
const DAILY_TASK_LIMIT = 10;
const DAILY_TASK_REWARD = { coins: 10, spins: 1 };

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const specialTasks = await SpecialTask.find({ active: true });
    res.json({
      success: true,
      dailyTasks: [{ id: DAILY_TASK_ID, name: "Watch Short Ad", ...DAILY_TASK_REWARD }],
      specialTasks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Complete a task
router.post("/complete", async (req, res) => {
  try {
    const { telegramId, taskId } = req.body;
    const user = await User.findOne({ telegramId });
    if(!user) return res.status(404).json({ success: false, message: "User not found" });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if(!user.dailyTasks) user.dailyTasks = {};
    if(!user.dailyTasks[today]) user.dailyTasks[today] = 0;

    // Daily Watch Ad Task
    if(taskId == DAILY_TASK_ID){
      if(user.dailyTasks[today] >= DAILY_TASK_LIMIT)
        return res.status(400).json({ success: false, message: "Daily limit reached" });

      user.coins += DAILY_TASK_REWARD.coins;
      user.spins += DAILY_TASK_REWARD.spins;
      user.dailyTasks[today] += 1;
      await user.save();

      return res.json({ success: true, reward: DAILY_TASK_REWARD, user });
    }

    // Special Tasks
    const specialTask = await SpecialTask.findById(taskId);
    if(specialTask){
      user.coins += specialTask.coins;
      user.spins += specialTask.spins;
      await user.save();

      return res.json({
        success: true,
        reward: { coins: specialTask.coins, spins: specialTask.spins },
        user
      });
    }

    res.status(400).json({ success: false, message: "Task not found" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
