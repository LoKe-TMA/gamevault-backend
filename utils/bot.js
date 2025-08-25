const axios = require("axios");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

async function sendMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("Telegram Error:", err.response?.data || err.message);
  }
}

async function notifyAdmin(text) {
  return sendMessage(ADMIN_ID, text);
}

module.exports = { sendMessage, notifyAdmin };
