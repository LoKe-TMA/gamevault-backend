const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    tgId: { type: String, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    coins: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: null }, // referralCode of inviter
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
