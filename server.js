const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors'); // Added for cross-origin support
const app = express();

app.use(bodyParser.json());
app.use(cors()); // Allow cross-origin requests (e.g., from Telegram Mini App)

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://demon80706:Demon0909%40@cluster0.xp0t4ou.mongodb.net/TestVault?retryWrites=true&w=majority&appName=Cluster0'; // Use env var
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
    referBonuses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completedDaily: { type: Boolean, default: false },
    orders: [{ type: { type: String }, item: String, price: Number, accountId: String, serverId: String, status: { type: String, default: 'pending' } }]
});

const TaskSchema = new mongoose.Schema({
    name: String,
    type: String,
    id: String,
    reward: Number
});

const User = mongoose.model('User', UserSchema);
const Task = mongoose.model('Task', TaskSchema);

// Telegram Bot
const botToken = process.env.TELEGRAM_BOT_TOKEN || '8488031831:AAHopBgCsSKJKe1_V3h1PlsU2zN8eX5C8Jc';
const bot = new TelegramBot(botToken, { polling: true });
const adminId = process.env.ADMIN_TELEGRAM_ID || 6457035708;

// Register Endpoint
app.post('/register', async (req, res) => {
    try {
        console.log('Received /register request:', req.body); // Debug log
        let user = await User.findOne({ telegramId: req.body.telegramId });
        if (!user) {
            user = new User({ telegramId: req.body.telegramId, username: req.body.username });
            await user.save();
            console.log('New user registered:', user);
        }
        res.json({ coins: user.coins });
    } catch (err) {
        console.error('Error in /register:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Other Endpoints (simplified for brevity, include from previous server.js)
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
        console.error('Error in /place-order:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/reward-ad', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.body.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.coins += 100;
        user.completedDaily = true;
        await user.save();
        bot.sendMessage(req.body.telegramId, '🎁 Task Reward Earned');
        res.json({ coins: user.coins });
    } catch (err) {
        console.error('Error in /reward-ad:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

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
        console.error('Error in /check-referral-bonus:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/special-tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        console.error('Error in /special-tasks:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/verify-task', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.body.telegramId });
        const task = await Task.findById(req.body.taskId);
        if (!user || !task) return res.status(404).json({ error: 'User or task not found' });
        user.coins += task.reward;
        await user.save();
        res.json({ verified: true, coins: user.coins });
    } catch (err) {
        console.error('Error in /verify-task:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/refer-info', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.query.telegramId }).populate('referrals');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ friends: user.referrals.length, referCoins: user.referrals.length * 100 });
    } catch (err) {
        console.error('Error in /refer-info:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.query.telegramId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.orders);
    } catch (err) {
        console.error('Error in /orders:', err);
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
        console.error('Error in /start:', err);
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
        console.error('Error in /confirm:', err);
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
        user.coins += order.price;
        await user.save();
        bot.sendMessage(user.telegramId, `❌ Order Rejected: ${match[3]}`);
    } catch (err) {
        console.error('Error in /reject:', err);
        bot.sendMessage(msg.from.id, 'Error rejecting order');
    }
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    if (msg.from.id !== adminId) return;
    try {
        const users = await User.find();
        users.forEach(u => bot.sendMessage(u.telegramId, match[1]));
        bot.sendMessage(msg.from.id, 'Broadcast sent');
    } catch (err) {
        console.error('Error in /broadcast:', err);
        bot.sendMessage(msg.from.id, 'Error broadcasting message');
    }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Port Binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
