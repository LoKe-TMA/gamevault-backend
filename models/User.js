const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String },
  first_name: { type: String },
  last_name: { type: String },
  photo_url: { type: String },
  coin_balance: { type: Number, default: 0 },
  referred_by: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
