const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('./models/User');
const Order = require('./models/Order');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// =======================
//   API ENDPOINTS
// =======================

// User Authentication (Auto-login/Register)
app.post('/api/auth', async (req, res) => {
    const { id, first_name, username, start_payload } = req.body;
    try {
        let user = await User.findOne({ telegramId: id });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            user = new User({
                telegramId: id,
                firstName: first_name,
                username: username,
            });

            // Referral Logic
            if (start_payload && start_payload.startsWith('ref_')) {
                const referredByTelegramId = parseInt(start_payload.substring(4));
                user.referredBy = referredByTelegramId;
            }

            await user.save();
        }
        
        res.status(200).json({
            message: 'Authentication successful',
            isNewUser: isNewUser,
            user: {
                telegramId: user.telegramId,
                firstName: user.firstName,
                coinBalance: user.coinBalance,
                referredBy: user.referredBy
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during authentication' });
    }
});

// Get User Data
app.get('/api/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findOne({ telegramId: id });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update Coin Balance
app.post('/api/user/update-coins', async (req, res) => {
    const { id, coins } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { telegramId: id },
            { $inc: { coinBalance: coins } },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'Coins updated successfully', newBalance: user.coinBalance });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


// Place an Order
app.post('/api/orders', async (req, res) => {
    const { userId, orderType, item, price, accountId, serverId } = req.body;
    try {
        const user = await User.findOne({ telegramId: userId });
        if (!user || user.coinBalance < price) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }

        user.coinBalance -= price;
        await user.save();

        const newOrder = new Order({ userId, orderType, item, price, accountId, serverId });
        await newOrder.save();

        // TODO: Send order notification to Admin Bot
        
        res.status(201).json({ message: 'Order placed successfully', newBalance: user.coinBalance });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get User's Orders
app.get('/api/orders/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// =======================
//   Task Endpoints
// =======================

// Watch Ad Task
app.post('/api/tasks/watch-ad', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findOne({ telegramId: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const now = new Date();
        const lastReset = new Date(user.lastAdReset);
        
        // Check if a new day has started (after 12 AM)
        if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
            user.adWatchCount = 0; // Reset count for the new day
            user.lastAdReset = now;
        }

        if (user.adWatchCount >= 20) {
            return res.status(429).json({ error: 'Daily ad limit reached' });
        }

        user.adWatchCount += 1;
        
        // Reward user every 5 ads (example)
        if (user.adWatchCount % 5 === 0) {
            user.coinBalance += 50; // Reward 50 coins
        }
        
        await user.save();
        
        // Check for referral bonus (if new user has watched 100% of ads)
        if (user.referredBy && !user.referralBonusReceived && user.adWatchCount >= 20) {
            const referrer = await User.findOne({ telegramId: user.referredBy });
            if (referrer) {
                referrer.coinBalance += 100; // Referrer gets 100 coins
                await referrer.save();
                user.referralBonusReceived = true;
                await user.save();
                // TODO: Send notification to referrer via Bot
            }
        }
        
        res.status(200).json({
            message: 'Ad watched successfully',
            count: user.adWatchCount,
            newBalance: user.coinBalance
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
