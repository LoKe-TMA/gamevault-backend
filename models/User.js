const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  username: String,
  first_name: String,
  last_name: String,
  photo_url: String,
  coin_balance: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
