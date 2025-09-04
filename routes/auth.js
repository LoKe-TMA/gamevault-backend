const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateInitData } = require('../utils/verifyInitData');

function mkReferralCode(tgId) {
  // very simple & unique-ish for MVP
  return `ref_${Number(tgId).toString(36)}`;
}

router.post('/login', async (req, res) => {
  try {
    const { initData } = req.body;
    if (!initData) return res.status(400).json({ error: 'initData required' });

    const { ok, user: tgUser, params, reason } = validateInitData(
      initData,
      process.env.BOT_TOKEN,
      24 * 3600 // accept within 24h
    );

    if (!ok) return res.status(401).json({ error: 'invalid initData', reason });

    const tgId = String(tgUser?.id || '');
    if (!tgId) return res.status(400).json({ error: 'no tg user id' });

    // Find or create user
    let user = await User.findOne({ tgId });
    if (!user) {
      user = new User({
        tgId,
        username: tgUser.username || '',
        firstName: tgUser.first_name || '',
        lastName: tgUser.last_name || '',
        coins: 0,
        referralCode: mkReferralCode(tgId),
      });

      // Capture referral at first login (start_param from initData)
      const startParam = params.start_param || '';
      if (startParam && startParam.startsWith('ref_')) {
        user.referredBy = startParam;
      }

      await user.save();
    } else {
      // keep profile fresh
      user.username = tgUser.username || user.username;
      user.firstName = tgUser.first_name || user.firstName;
      user.lastName = tgUser.last_name || user.lastName;
      await user.save();
    }

    const token = jwt.sign({ uid: user._id, tgId: user.tgId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        tgId: user.tgId,
        username: user.username,
        firstName: user.firstName,
        coins: user.coins,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
