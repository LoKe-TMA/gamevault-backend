const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Auto register/login + return DB data
router.post("/login", async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username } = req.body;

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, firstName, lastName, username });
      await user.save();
    }

    res.json({ success: true, user }); // user from DB
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get user by telegramId
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if(!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
