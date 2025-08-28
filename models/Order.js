const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  game: String,         // "PUBG" or "MLBB"
  package: String,      // e.g. UC 60
  price: Number,        // in coins
  accountId: String,    // required for both PUBG & MLBB
  serverId: String,     // only for MLBB
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
