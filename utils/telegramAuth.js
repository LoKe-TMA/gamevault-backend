// backend/utils/telegramAuth.js
import crypto from "crypto";

export function validateTelegramAuth(initData) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  urlParams.delete("hash");

  const dataCheckString = [...urlParams.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData")
    .update(process.env.BOT_TOKEN)
    .digest();

  const _hash = crypto.createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (_hash !== hash) return null;

  const userData = JSON.parse(urlParams.get("user"));
  return userData;
}
