const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  type: { type: String, enum: ["ad", "channel", "bot"], required: true },
  title: String,
  description: String,
  url: String, // Channel or Bot link
  reward: Number,
  limit: { type: Number, default: 1 },
  verify: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
