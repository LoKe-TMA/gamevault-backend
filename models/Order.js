// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  game: String,
  item: String,
  priceCoins: Number,
  accountId: String,
  serverId: String,
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);

