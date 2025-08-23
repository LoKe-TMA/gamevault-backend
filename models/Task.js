const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  type: { type: String, enum: ["ad", "channel"], required: true }, 
  title: { type: String, required: true },
  description: String,
  link: String, // For channel/bot join tasks
  rewardCoins: { type: Number, default: 0 },
  rewardSpins: { type: Number, default: 0 },
  dailyLimit: { type: Number, default: 0 }, // e.g. 20 ads per day
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
