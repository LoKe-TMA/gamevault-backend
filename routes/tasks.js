// backend/routes/tasks.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Track daily ads (in-memory per day, not DB)
let dailyAds = {}; // { telegramId: { count: 0, date: "2025-08-30" } }

function resetDailyIfNeeded(userId) {
  const today = new Date().toISOString().slice(0, 10);
  if (!dailyAds[userId] || dailyAds[userId].date !== today) {
    dailyAds[userId] = { count: 0, date: today };
  }
}

// Watch Ad
router.post("/watch", async (req, res) => {
  try {
    const { telegramId } = req.body;
    resetDailyIfNeeded(telegramId);

    if (dailyAds[telegramId].count >= 20) {
      return res.status(400).json({ error: "Daily limit reached" });
    }

    dailyAds[telegramId].count++;

    // Add coins (reward per ad = 50?)
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.coins += 50;
    await user.save();

    // If user reached 20 ads → trigger referral bonus check
    if (dailyAds[telegramId].count === 20) {
      checkReferralBonus(user);
    }

    res.json({
      success: true,
      watched: dailyAds[telegramId].count,
      reward: 50,
      totalCoins: user.coins
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

// Helper for referral check
async function checkReferralBonus(user) {
  if (!user) return;
  const inviterId = user.referredBy;
  if (!inviterId) return;

  const inviter = await User.findOne({ telegramId: inviterId });
  if (!inviter) return;

  // Give inviter bonus 100 coins
  inviter.coins += 100;
  await inviter.save();

  // Send bot message
  import("./../utils/bot.js").then(({ bot }) => {
    bot.sendMessage(inviter.telegramId, `🎁 Referral Bonus: Your friend ${user.name} completed daily tasks! +100 coins`);
  });
}
