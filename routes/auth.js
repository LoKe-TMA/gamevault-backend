const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Auto Register/Login
router.post("/login", async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username, photoUrl } = req.body;

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, firstName, lastName, username, photoUrl });
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
