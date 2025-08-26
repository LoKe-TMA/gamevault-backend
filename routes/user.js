'const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/users/auth
// body: { telegramId, username, firstName, lastName, photoUrl }
router.post('/auth', async (req, res) => {
  try {
    const { telegramId, username, firstName, lastName, photoUrl } = req.body;
    if (!telegramId) return res.status(400).json({ success: false, message: 'telegramId required' });

    let user = await User.findOne({ telegramId });
    if (!user) {
      user = new User({ telegramId, username, firstName, lastName, photoUrl, coins: 0 });
      await user.save();
    } else {
      // update basic fields if changed
      user.username = username || user.username;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.photoUrl = photoUrl || user.photoUrl;
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:telegramId
router.get('/:telegramId', async (req, res) => {
  try {
    const user = await User.findOne({ telegramId: req.params.telegramId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
