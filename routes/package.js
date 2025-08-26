const express = require('express');
const router = express.Router();
const Package = require('../models/Package');

// GET /api/packages
router.get('/', async (req, res) => {
  try {
    const packs = await Package.find().sort({ price: 1 });
    res.json({ success: true, packages: packs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/packages/seed  (call once to seed packages)
router.post('/seed', async (req, res) => {
  try {
    const items = [
      { game: 'pubg', name: '60 UC', price: 4500, image: '' },
      { game: 'pubg', name: '180 UC', price: 13500, image: '' },
      { game: 'pubg', name: '325 UC', price: 21000, image: '' },
      { game: 'pubg', name: '385 UC', price: 25500, image: '' },
      { game: 'mlbb', name: 'Weekly Pass', price: 6500, image: '' },
      { game: 'mlbb', name: '86 Diamonds', price: 5500, image: '' },
      { game: 'mlbb', name: '172 Diamonds', price: 11000, image: '' },
      { game: 'mlbb', name: '257 Diamonds', price: 16500, image: '' }
    ];
    await Package.deleteMany({});
    await Package.insertMany(items);
    res.json({ success: true, seeded: items.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
