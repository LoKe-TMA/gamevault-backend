const crypto = require('crypto');

/**
 * Parse initData string -> plain object
 */
function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const out = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

/**
 * Build data-check-string
 */
function buildDataCheckString(obj) {
  return Object.keys(obj)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${obj[k]}`)
    .join('\n');
}

/**
 * Validate Telegram WebApp initData.
 * Secret = HMAC-SHA256(bot_token, key="WebAppData")
 * Then: hash = HMAC-SHA256(data_check_string, key=secret)
 */
function validateInitData(initData, botToken, maxAgeSec = 3600) {
  const paramsObj = parseInitData(initData);
  const { hash, auth_date } = paramsObj;
  if (!hash || !auth_date) {
    return { ok: false, reason: 'missing hash/auth_date' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (maxAgeSec > 0 && now - Number(auth_date) > maxAgeSec) {
    return { ok: false, reason: 'expired' };
  }

  const dataCheckString = buildDataCheckString(paramsObj);

  // secret = HMAC-SHA256( botToken, key="WebAppData" )
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

  // localHash = HMAC-SHA256( dataCheckString, key=secret )
  const localHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const ok = localHash === hash;

  // Try parse embedded user JSON for convenience
  let tgUser = null;
  try {
    if (paramsObj.user) tgUser = JSON.parse(paramsObj.user);
  } catch (e) {}

  return { ok, user: tgUser, params: paramsObj, reason: ok ? null : 'hash mismatch' };
}

module.exports = { validateInitData };
