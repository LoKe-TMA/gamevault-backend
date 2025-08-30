// backend/routes/ads.js
import express from "express";
import Ad from "../models/Ad.js";

const router = express.Router();

// Get all ads
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find();
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Increment click count
router.patch("/:id/click", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Ad not found" });
    ad.clickCount += 1;
    await ad.save();
    res.json({ success: true, clicks: ad.clickCount });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
