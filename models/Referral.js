const mongoose = require("mongoose");

const ReferralSchema = new mongoose.Schema({
  inviterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rewarded: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Referral", ReferralSchema);
