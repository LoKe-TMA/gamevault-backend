const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch((e) => console.error('Mongo error', e));

// Routes
app.use('/api/auth', require('./routes/auth'));

app.get('/', (_req, res) => res.send('GameVault API OK'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));
