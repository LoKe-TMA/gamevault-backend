const express = require("express");
const router = express.Router();
const Referral = require("../models/Referral");
const User = require("../models/User");

// POST /api/referrals
router.post("/", async (req, res) => {
  try {
    const { inviterId, friendId } = req.body;

    let referral = await Referral.findOne({ inviterId, friendId });
    if (!referral) {
      referral = new Referral({ inviterId, friendId });
      await referral.save();
    }

    res.json({ success: true, referral });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/referrals/:telegramId
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const referrals = await Referral.find({ inviterId: user._id });
    res.json({ success: true, totalFriends: referrals.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
