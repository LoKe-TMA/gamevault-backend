const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  photoUrl: String,
  coins: { type: Number, default: 0 },
  referredBy: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

