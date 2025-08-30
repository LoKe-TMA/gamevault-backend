// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true },
  name: String,
  coins: { type: Number, default: 0 },
  referrals: [{ type: String }], // store telegramIds of referred users
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
