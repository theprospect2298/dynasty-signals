'use strict';

const { config, validate } = require('./config');
const { availableSkills, runSkill } = require('./skills');
const { notify } = require('./notify');
const { log, error } = require('./logger');

async function main() {
  const arg = process.argv[2];

  if (!arg || arg === 'list') {
    const skills = availableSkills();
    console.log('Available skills:');
    for (const s of skills) console.log('  - ' + s);
    console.log('\nUsage: node src/cli.js <skill-name>   (e.g. node src/cli.js morning-brief)');
    console.log('Helpers: node src/cli.js notify-test   (send a test Telegram message)');
    console.log('         node src/cli.js chat-id       (find your Telegram chat id)');
    return;
  }

  // Print any chat ids that have messaged your bot (run after you message it).
  if (arg === 'chat-id') {
    if (!config.telegramBotToken) {
      error('TELEGRAM_BOT_TOKEN is not set in .env yet.');
      process.exit(1);
    }
    const url = `https://api.telegram.org/bot${config.telegramBotToken}/getUpdates`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.ok) {
      error(`Telegram API error: ${JSON.stringify(data)}`);
      process.exit(1);
    }
    const chats = new Map();
    for (const u of data.result || []) {
      const chat = (u.message || u.edited_message || {}).chat;
      if (chat) chats.set(chat.id, chat);
    }
    if (chats.size === 0) {
      console.log('No messages found. Open your bot in Telegram, press Start / send any');
      console.log('message, then run this command again.');
      process.exit(1);
    }
    console.log('Chat id(s) that messaged your bot:');
    for (const [id, chat] of chats) {
      const who = chat.username ? `@${chat.username}` : chat.first_name || chat.title || '';
      console.log(`  ${id}   ${who}`);
    }
    console.log('\nPut the number above into TELEGRAM_CHAT_ID in .env.');
    process.exit(0);
  }

  // Send a one-off test notification through the configured gateway.
  if (arg === 'notify-test') {
    const ok = await notify('Jarvis test notification — if you see this, Telegram is wired up.');
    if (ok) {
      log('Sent. Check your Telegram.');
      process.exit(0);
    }
    error('Not sent. Set NOTIFICATION_GATEWAY=telegram and TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID in .env, then retry.');
    process.exit(1);
  }

  const problems = validate();
  if (problems.length) {
    error('Configuration problems:');
    for (const p of problems) error('  - ' + p);
    process.exit(1);
  }

  const skills = availableSkills();
  if (!skills.includes(arg)) {
    error(`Unknown skill "${arg}". Available: ${skills.join(', ')}`);
    process.exit(1);
  }

  try {
    const result = await runSkill(arg);
    log('--- result summary ---');
    console.log(result);
    process.exit(0);
  } catch (err) {
    error(`Skill "${arg}" failed: ${err.message}`);
    process.exit(1);
  }
}

main();
