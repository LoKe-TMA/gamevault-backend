const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const router = express.Router();

// Create order
router.post("/create", async (req, res) => {
  const { userId, game, packageName, price, accountId, serverId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || user.coins < price) {
      return res.status(400).json({ error: "Not enough coins" });
    }

    user.coins -= price;
    await user.save();

    const order = new Order({
      userId,
      game,
      package: packageName,
      price,
      accountId,
      serverId
    });
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
