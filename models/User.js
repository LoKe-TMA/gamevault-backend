const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        default: ''
    },
    coinBalance: {
        type: Number,
        default: 0
    },
    adWatchCount: {
        type: Number,
        default: 0
    },
    lastAdReset: {
        type: Date,
        default: Date.now
    },
    referralBonusReceived: {
        type: Boolean,
        default: false
    },
    referredBy: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
