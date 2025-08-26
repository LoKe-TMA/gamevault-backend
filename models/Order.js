const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  game: String,
  item: String,
  accountId: String,
  zoneId: String,
  price: Number,
  status: { type: String, enum: ['pending','completed','failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
