'use strict';

const { config } = require('./config');
const { log, warn } = require('./logger');

async function sendTelegram(text) {
  if (!config.telegramBotToken || !config.telegramChatId) {
    warn('Telegram requested but token/chat id missing — skipping notification.');
    return false;
  }
  const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      warn(`Telegram send failed: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    warn(`Telegram send error: ${err.message}`);
    return false;
  }
}

// Gateway-agnostic entry point used by the filesystem tool layer.
async function notify(text) {
  if (config.notificationGateway === 'telegram') {
    const ok = await sendTelegram(text);
    if (ok) log(`Notified: ${text}`);
    return ok;
  }
  log(`(notify, gateway=${config.notificationGateway}) ${text}`);
  return false;
}

module.exports = { notify, sendTelegram };
