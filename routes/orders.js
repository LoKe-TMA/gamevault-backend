// backend/routes/orders.js
import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { sendOrderToAdmin } from "../utils/bot.js";

const router = express.Router();

// Create new order
router.post("/create", async (req, res) => {
  try {
    const { telegramId, game, item, priceCoins, accountId, serverId } = req.body;

    let user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.coins < priceCoins) {
      return res.status(400).json({ error: "Not enough coins" });
    }

    // Deduct coins
    user.coins -= priceCoins;
    await user.save();

    const order = new Order({
      userId: user._id,
      game,
      item,
      priceCoins,
      accountId,
      serverId
    });

    await order.save();

    // Notify admin via bot
    sendOrderToAdmin(order, user);

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's orders
router.get("/my/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
