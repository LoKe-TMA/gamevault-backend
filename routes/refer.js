// backend/routes/refer.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Referral info
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      coins: user.coins,
      referrals: user.referrals.length,
      referralLink: `https://t.me/${process.env.BOT_USERNAME}?start=${user.telegramId}`
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
