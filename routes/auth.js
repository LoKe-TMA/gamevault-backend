// backend/routes/auth.js
import express from "express";
import User from "../models/User.js";
import { validateTelegramAuth } from "../utils/telegramAuth.js";

const router = express.Router();

// Auto register/login
router.post("/login", async (req, res) => {
  try {
    const { initData } = req.body;
    const data = validateTelegramAuth(initData);

    if (!data) return res.status(400).json({ error: "Invalid Telegram auth" });

    let user = await User.findOne({ telegramId: data.id });
    if (!user) {
      user = new User({
        telegramId: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        coins: 0
      });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
