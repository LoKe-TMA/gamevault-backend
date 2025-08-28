const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// DB connect
connectDB();

// Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/orders", require("./routes/order"));

// Root endpoint (important for Render health check)
app.get("/", (req, res) => {
  res.send("🚀 Game Vault Backend is running successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
