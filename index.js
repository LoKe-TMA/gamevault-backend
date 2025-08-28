const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB connect
connectDB();

// Routes
app.use("/api/users", require("./routes/user"));
app.use("/api/orders", require("./routes/order"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
