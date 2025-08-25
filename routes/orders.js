const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const { notifyAdmin } = require("../utils/bot");

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { telegramId, game, orderType, accountId, serverId, cost } = req.body;

    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.coin_balance < cost) {
      return res.status(400).json({ success: false, message: "Not enough coins" });
    }

    user.coin_balance -= cost;
    await user.save();

    const order = new Order({ userId: user._id, game, orderType, accountId, serverId, cost });
    await order.save();

    await notifyAdmin(
      `🛒 New Order\n\n👤 User: ${user.username || user.telegramId}\n🎮 Game: ${game}\n📦 Type: ${orderType}\n💰 Cost: ${cost}\n🆔 Account: ${accountId}${serverId ? "/" + serverId : ""}\n\nStatus: Pending`
    );

    res.json({ success: true, order, new_balance: user.coin_balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/orders/:telegramId
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
