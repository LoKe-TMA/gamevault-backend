const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");

// Telegram login verification
router.post("/login", async (req, res) => {
    const { initData, referred_by } = req.body;

    function verifyTelegramData(data) {
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const secretKey = crypto.createHash('sha256').update(telegramBotToken).digest();
        
        const dataCheckString = Object.keys(data)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('\n');

        const hash = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        return hash === data.hash;
    }

    if (!verifyTelegramData(initData)) {
        return res.status(400).json({ message: "Invalid Telegram Data" });
    }

    try {
        let user = await User.findOne({ telegramId: initData.id });
        if (!user) {
            user = new User({
                telegramId: initData.id,
                username: initData.username,
                first_name: initData.first_name,
                last_name: initData.last_name,
                photo_url: initData.photo_url,
                referred_by: referred_by || null,
            });
            await user.save();
        }
        res.json({ success: true, user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
