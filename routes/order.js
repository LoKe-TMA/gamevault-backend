const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Package = require('../models/Package');
const { notifyAdmin } = require('../utils/bot');

// POST /api/orders
// body: { telegramId, packageId, accountId, zoneId }
router.post('/', async (req, res) => {
  try {
    const { telegramId, packageId, accountId, zoneId } = req.body;
    if (!telegramId || !packageId) return res.status(400).json({ success: false, message: 'Missing data' });

    const user = await User.findOne({ telegramId });
    const pkg = await Package.findById(packageId);
    if (!user || !pkg) return res.status(400).json({ success: false, message: 'Invalid user or package' });

    if (user.coins < pkg.price) return res.status(400).json({ success: false, message: 'Insufficient coins' });

    // Deduct and save
    user.coins -= pkg.price;
    await user.save();

    const order = new Order({
      userId: user._id,
      game: pkg.game,
      item: pkg.name,
      accountId,
      zoneId,
      price: pkg.price,
      status: 'pending'
    });
    await order.save();

    // Notify admin
    await notifyAdmin(
      `🛒 *New Order*\nUser: ${user.username || user.telegramId}\nGame: ${pkg.game}\nItem: ${pkg.name}\nPrice: ${pkg.price}\nAccount: ${accountId}${zoneId ? ' / ' + zoneId : ''}\nOrderId: ${order._id}`
    );

    res.json({ success: true, order, new_balance: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/orders/:telegramId
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.json({ success: true, orders: [] });
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
