const mongoose = require("mongoose");

const SpecialTaskSchema = new mongoose.Schema({
  name: { type: String, required: true },        // Task Name (e.g., Join Telegram Channel)
  type: { type: String, required: true },        // "channel" / "bot" / etc
  coins: { type: Number, default: 0 },           // Reward coins
  spins: { type: Number, default: 0 },           // Reward spins
  active: { type: Boolean, default: true },      // Enable/Disable task
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("SpecialTask", SpecialTaskSchema);
