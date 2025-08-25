const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://demon80706:Demon0909%40@cluster0.xp0t4ou.mongodb.net/TestVault?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your Atlas URI
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
    telegramId: Number,
    username: String,
    coins: { type: Number, default: 0 },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    referer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referBonuses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added to track bonuses
    completedDaily: { type: Boolean, default: false },
    orders: [{ type: { type: String }, item: String, price: Number, accountId: String, serverId: String, status: { type: String, default: 'pending' } }]
});

const TaskSchema = new mongoose.Schema({
    name: String,
    type: String, // channel or bot
    id: String,
    reward: Number
});

const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);

// Telegram Bot
const botToken = '8488031831:AAHopBgCsSKJKe1_V3h1PlsU2zN8eX5C8Jc'; // Replace with your bot token
const bot = new TelegramBot(botToken, { polling: true });
const adminId = 6457035708; // Replace with admin Telegram ID

// Register
app.post('/register', async (req, res) => {
    try {
        let user = await User.findOne({ telegramId: req.body.telegramId });
        if (!user) {
            user = new User({ telegramId: req.body.telegramId, username: req.body.username });
            await user.save();
        }
        res.json({ coins: user.coins });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Place Order
app.post('/place-order', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.body.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.coins -= req.body.price;
        user.orders.push({
            type: req.body.type,
            item: req.body.item,
            price: req.body.price,
            accountId: req.body.accountId,
            serverId: req.body.serverId
        });
        await user.save();
        bot.sendMessage(adminId, `New Order: ${req.body.type} ${req.body.item} for user ${user.username}. Account: ${req.body.accountId} ${req.body.serverId ? 'Server: ' + req.body.serverId : ''}`);
        bot.sendMessage(req.body.telegramId, '✅ Order Placed');
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reward Ad
app.post('/reward-ad', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.body.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.coins += 100; // Example reward
        user.completedDaily = true;
        await user.save();
        bot.sendMessage(req.body.telegramId, '🎁 Task Reward Earned');
        res.json({ coins: user.coins });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check Referral Bonus
app.post('/check-referral-bonus', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.body.telegramId });
        if (!user || !user.completedDaily || !user.referer) return res.json({ bonusAdded: false });
        const referer = await User.findById(user.referer);
        if (!referer.referBonuses.includes(user._id)) {
            referer.coins += 100;
            referer.referBonuses.push(user._id);
            await referer.save();
            bot.sendMessage(referer.telegramId, '🎁 Referral Bonus Received');
            res.json({ bonusAdded: true });
        } else {
            res.json({ bonusAdded: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Special Tasks
app.get('/special-tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/verify-task', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.body.telegramId });
        const task = await Task.findById(req.body.taskId);
        if (!user || !task) return res.status(404).json({ error: 'User or task not found' });
        // Verify join via Telegram API (simplified for now)
        user.coins += task.reward;
        await user.save();
        res.json({ verified: true, coins: user.coins });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Refer Info
app.get('/refer-info', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.query.telegramId }).populate('referrals');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ friends: user.referrals.length, referCoins: user.referrals.length * 100 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Orders
app.get('/orders', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.query.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bot Handlers
bot.onText(/\/start (\d+)/, async (msg, match) => {
    try {
        const refererId = match[1];
        const user = await User.findOne({ telegramId: msg.from.id });
        if (user && !user.referer) {
            user.referer = (await User.findOne({ telegramId: refererId }))._id;
            const referer = await User.findOne({ telegramId: refererId });
            referer.referrals.push(user._id);
            await referer.save();
            await user.save();
        }
    } catch (err) {
        console.error(err);
    }
});

bot.onText(/\/confirm (\d+) (\w+)/, async (msg, match) => {
    if (msg.from.id !== adminId) return;
    try {
        const user = await User.findOne({ 'orders._id': match[2] });
        if (!user) return bot.sendMessage(msg.from.id, 'Order not found');
        const order = user.orders.id(match[2]);
        order.status = 'confirmed';
        await user.save();
        bot.sendMessage(user.telegramId, '✅ Order Confirmed');
    } catch (err) {
        console.error(err);
        bot.sendMessage(msg.from.id, 'Error confirming order');
    }
});

bot.onText(/\/reject (\d+) (\w+) (.+)/, async (msg, match) => {
    if (msg.from.id !== adminId) return;
    try {
        const user = await User.findOne({ 'orders._id': match[2] });
        if (!user) return bot.sendMessage(msg.from.id, 'Order not found');
        const order = user.orders.id(match[2]);
        order.status = 'rejected';
        user.coins += order.price; // Refund coins
        await user.save();
        bot.sendMessage(user.telegramId, `❌ Order Rejected: ${match[3]}`);
    } catch (err) {
        console.error(err);
        bot.sendMessage(msg.from.id, 'Error rejecting order');
    }
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    if (msg.from.id !== adminId) return;
    try {
        const users = await User.find();
        users.forEach(u => bot.sendMessage(u.telegramId, match[1]));
    } catch (err) {
        console.error(err);
        bot.sendMessage(msg.from.id, 'Error broadcasting message');
    }
});

// Port Binding for Render.com
const PORT = process.env.PORT || 10000; // Use Render's PORT or default to 10000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
