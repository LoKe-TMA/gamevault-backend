const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  game: { type: String, enum: ["PUBG", "MLBB"], required: true },
  package: String,
  accountId: String,
  serverId: String,
  coinsUsed: Number,
  status: { type: String, enum: ["Pending", "Confirmed", "Rejected"], default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
