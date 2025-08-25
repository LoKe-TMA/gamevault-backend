const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username, photoUrl } = req.body;

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({
        telegramId,
        firstName,
        lastName,
        username,
        photoUrl,
        coins: 0
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
