const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.js");



dotenv.config();
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

// ✅ MongoDB Atlas Connect (direct in server.js)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected..."))
.catch(err => {
  console.error("❌ MongoDB Connection Failed:", err.message);
  process.exit(1);
});

// Routes test
app.get("/", (req, res) => {
  res.send("Game Vault Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
