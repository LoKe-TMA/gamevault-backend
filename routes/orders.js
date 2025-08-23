const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");

// Create new order
router.post("/create", async (req, res) => {
  try {
    const { telegramId, game, packageName, priceCoins, accountId, zoneId } = req.body;

    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.coins < priceCoins) {
      return res.json({ success: false, message: "Not enough coins" });
    }

    // Deduct coins
    user.coins -= priceCoins;
    await user.save();

    const order = new Order({
      userId: user._id,
      game,
      package: packageName,
      priceCoins,
      accountId,
      zoneId
    });
    await order.save();

    res.json({ success: true, order, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get my orders
router.get("/:telegramId", async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
