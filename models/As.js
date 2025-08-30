// backend/models/Ad.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  imageUrl: String,
  clickUrl: String,
  clickCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Ad", adSchema);
