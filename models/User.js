const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  username: String,
  photoUrl: String,

  coins: { type: Number, default: 100 }, // Start coins
  spins: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
