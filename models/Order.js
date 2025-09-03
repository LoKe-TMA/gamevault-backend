const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: Number,
        required: true
    },
    orderType: {
        type: String,
        required: true
    },
    item: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    accountId: {
        type: String,
        required: true
    },
    serverId: {
        type: String,
        default: null // For MLBB orders
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
