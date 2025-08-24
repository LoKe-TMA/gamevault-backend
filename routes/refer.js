// routes/refer.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Get referral stats
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.json({ success: false, message: "User not found" });

    res.json({
      success: true,
      referrals: user.referrals || 0,
      referralCoins: (user.referrals || 0) * 100
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ✅ Add referral
router.post("/add", async (req, res) => {
  try {
    const { inviterId, newUserId } = req.body;

    const inviter = await User.findOne({ telegramId: inviterId });
    const newUser = await User.findOne({ telegramId: newUserId });

    if (!inviter || !newUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Prevent self-invite
    if (inviterId === newUserId) {
      return res.json({ success: false, message: "Cannot invite yourself" });
    }

    // Prevent duplicate counting
    if (newUser.referredBy) {
      return res.json({ success: false, message: "Already referred" });
    }

    // Mark referral
    newUser.referredBy = inviterId;
    await newUser.save();

    inviter.referrals = (inviter.referrals || 0) + 1;
    inviter.coins += 100; // reward
    await inviter.save();

    res.json({ success: true, message: "Referral added", coins: inviter.coins });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
