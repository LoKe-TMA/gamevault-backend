// backend/utils/bot.js
import TelegramBot from "node-telegram-bot-api";
import Order from "../models/Order.js";
import User from "../models/User.js";

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const ADMIN_ID = process.env.ADMIN_ID; // Telegram ID of admin

// Send new order to admin
export async function sendOrderToAdmin(order, user) {
  const msg = `
🛒 *New Order*  
👤 User: ${user.name} (${user.telegramId})  
🎮 Game: ${order.game}  
📦 Item: ${order.item}  
💰 Coins: ${order.priceCoins}  
🆔 Account: ${order.accountId} ${order.serverId ? `/ ${order.serverId}` : ""}
  `;

  bot.sendMessage(ADMIN_ID, msg, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✅ Confirm", callback_data: `confirm_${order._id}` },
          { text: "❌ Reject", callback_data: `reject_${order._id}` }
        ]
      ]
    }
  });
}

// Handle admin decision
bot.on("callback_query", async (query) => {
  const [action, orderId] = query.data.split("_");
  const order = await Order.findById(orderId).populate("userId");

  if (!order) return bot.answerCallbackQuery(query.id, { text: "Order not found" });

  if (action === "confirm") {
    order.status = "confirmed";
    await order.save();
    bot.sendMessage(order.userId.telegramId, `✅ Order Confirmed: ${order.item}`);
  } else if (action === "reject") {
    order.status = "rejected";
    await order.save();
    // Refund coins
    const user = await User.findById(order.userId);
    user.coins += order.priceCoins;
    await user.save();
    bot.sendMessage(order.userId.telegramId, `❌ Order Rejected: ${order.item}\nCoins refunded.`);
  }

  bot.answerCallbackQuery(query.id, { text: `Order ${action}ed` });
});
