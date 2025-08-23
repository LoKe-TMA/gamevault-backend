const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  username: String,
  coins: { type: Number, default: 0 },
  spins: { type: Number, default: 0 },
  referrals: { type: Number, default: 0 },
  dailyTasks: { type: Object, default: {} } // { "2025-08-23": 3 }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
