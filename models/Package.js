const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  game: { type: String, required: true }, // 'pubg' or 'mlbb'
  name: { type: String, required: true },
  price: { type: Number, required: true }, // in Coins
  image: String
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);
