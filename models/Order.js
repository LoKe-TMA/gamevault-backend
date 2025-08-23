const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  game: { type: String, enum: ["PUBG", "MLBB"], required: true },
  package: { type: String, required: true }, // UC 60 / Weekly Pass
  priceCoins: { type: Number, required: true },

  accountId: String,
  zoneId: String, // For MLBB only

  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reason: String // Reject reason
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
