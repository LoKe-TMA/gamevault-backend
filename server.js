// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
app.use(bodyParser.json());

const mongoURI = 'mongodb+srv://demon80706:Demon0909%40@cluster0.xp0t4ou.mongodb.net/TestVault?retryWrites=true&w=majority&appName=Cluster0'; // Replace with your Atlas URI
mongoose.connect(mongoURI);

const UserSchema = new mongoose.Schema({
    telegramId: Number,
    username: String,
    coins: { type: Number, default: 0 },
    referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    referer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedDaily: { type: Boolean, default: false }, // To track for referral bonus
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

const botToken = '8488031831:AAHopBgCsSKJKe1_V3h1PlsU2zN8eX5C8Jc';
const bot = new TelegramBot(botToken, { polling: true });
const adminId = 6457035708; // Replace with admin ID

// Register
app.post('/register', async (req, res) => {
    let user = await User.findOne({ telegramId: req.body.telegramId });
    if (!user) {
        user = new User({ telegramId: req.body.telegramId, username: req.body.username });
        await user.save();
    }
    // Handle referral if start param, but assume handled in bot
    res.json({ coins: user.coins });
});

// Place Order
app.post('/place-order', async (req, res) => {
    const user = await User.findOne({ telegramId: req.body.telegramId });
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
});

// Reward Ad (assume reward 100 coins per ad, adjust as needed)
app.post('/reward-ad', async (req, res) => {
    const user = await User.findOne({ telegramId: req.body.telegramId });
    user.coins += 100; // Example reward
    user.completedDaily = true; // Flag for referral
    await user.save();
    bot.sendMessage(req.body.telegramId, '🎁 Task Reward Earned');
    res.json({ coins: user.coins });
});

// Check Referral Bonus
app.post('/check-referral-bonus', async (req, res) => {
    const user = await User.findOne({ telegramId: req.body.telegramId });
    if (user.completedDaily && user.referer) {
        const referer = await User.findById(user.referer);
        if (!referer.referBonuses.includes(user._id)) { // Avoid duplicate, assume add field referBonuses: []
            referer.coins += 100;
            referer.referBonuses.push(user._id);
            await referer.save();
            bot.sendMessage(referer.telegramId, '🎁 Referral Bonus Received');
            res.json({ bonusAdded: true });
        }
    }
    res.json({ bonusAdded: false });
});

// Special Tasks
app.get('/special-tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/verify-task', async (req, res) => {
    // Use Telegram API to verify join, but for simplicity assume verified
    // In real, use bot.getChatMember or similar
    const user = await User.findOne({ telegramId: req.body.telegramId });
    const task = await Task.findById(req.body.taskId);
    user.coins += task.reward;
    await user.save();
    res.json({ verified: true, coins: user.coins });
});

// Refer Info
app.get('/refer-info', async (req, res) => {
    const user = await User.findOne({ telegramId: req.query.telegramId }).populate('referrals');
    res.json({ friends: user.referrals.length, referCoins: user.referrals.length * 100 });
});

// Orders
app.get('/orders', async (req, res) => {
    const user = await User.findOne({ telegramId: req.query.telegramId });
    res.json(user.orders);
});

// Bot handlers
bot.onText(/\/start (\d+)/, async (msg, match) => {
    const refererId = match[1];
    const user = await User.findOne({ telegramId: msg.from.id });
    if (user && !user.referer) {
        user.referer = await User.findOne({ telegramId: refererId })._id;
        const referer = await User.findOne({ telegramId: refererId });
        referer.referrals.push(user._id);
        await referer.save();
        await user.save();
    }
});

bot.onText(/\/confirm (\d+) (\w+)/, async (msg, match) => {
    if (msg.from.id !== adminId) return;
    const orderIndex = match[1];
    const user = await User.findOne({ 'orders._id': match[2] }); // Assume order id
    // Update status to confirmed
    // user.orders[orderIndex].status = 'confirmed';
    await user.save();
    bot.sendMessage(user.telegramId, '✅ Order Confirmed');
});

bot.onText(/\/reject (\d+) (\w+) (.+)/, async (msg, match) => {
    if (msg.from.id !== adminId) return;
    const orderIndex = match[1];
    const reason = match[3];
    const user = await User.findOne({ 'orders._id': match[2] });
    // user.orders[orderIndex].status = 'rejected';
    // Refund coins if needed
    await user.save();
    bot.sendMessage(user.telegramId, `❌ Order Rejected: ${reason}`);
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
    if (msg.from.id !== adminId) return;
    const message = match[1];
    const users = await User.find();
    users.forEach(u => bot.sendMessage(u.telegramId, message));
});

// For managing special tasks, since no dashboard, use bot commands or direct DB
// Example: /addtask name type id reward

app.listen(3000, () => console.log('Server running'));
