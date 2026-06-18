'use strict';

const fs = require('fs');
const path = require('path');
const { config } = require('./config');
const { availableSkills, runSkill } = require('./skills');
const { log, warn, error } = require('./logger');

const apiBase = () => `https://api.telegram.org/bot${config.telegramBotToken}`;

async function tg(method, body) {
  const res = await fetch(`${apiBase()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

function reply(text, markdown) {
  return tg('sendMessage', {
    chat_id: config.telegramChatId,
    text,
    parse_mode: markdown ? 'Markdown' : undefined,
    disable_web_page_preview: true,
  });
}

function clamp(s, n = 3500) {
  s = String(s || '');
  return s.length > n ? s.slice(0, n - 20) + '\n…(truncated)' : s;
}

// ---- daily-note capture ---------------------------------------------------

function todayDaily() {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return { date, file: path.join(config.vaultPath, '03-DAILY', `${date}.md`) };
}

function appendCapture(text) {
  const { date, file } = todayDaily();
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      `---\ntype: daily\ndate: ${date}\n---\n\n# Daily Note — ${date}\n\n` +
        `## Captures\n\n## Open Loops\n\n## Tomorrow\n\n## Log\n`,
      'utf8'
    );
  }
  let content = fs.readFileSync(file, 'utf8');
  const marker = '## Captures';
  const idx = content.indexOf(marker);
  const line = `- ${text}`;
  if (idx >= 0) {
    const insertAt = content.indexOf('\n', idx) + 1;
    content = content.slice(0, insertAt) + line + '\n' + content.slice(insertAt);
  } else {
    content += `\n## Captures\n${line}\n`;
  }
  fs.writeFileSync(file, content, 'utf8');
  return date;
}

function helpText() {
  return [
    '🤖 *Jarvis controls*',
    '',
    '/brief — run today’s morning brief',
    '/capture <note> — save a note to today’s daily note',
    '/process — file today’s captures now',
    '/find <niche>, <location> — queue a lead-finding pipeline',
    '/status — Mission Control status',
    '/skill <name> — run any skill (/skills to list)',
    '/help — this message',
  ].join('\n');
}

// ---- command handling -----------------------------------------------------

// `send` is injectable for testing; defaults to real Telegram replies.
async function handle(msg, send) {
  send = send || ((t, md) => reply(t, md));
  const text = (msg.text || '').trim();
  if (!text) return;

  // Security: only the configured owner may command the bot.
  if (String(msg.chat && msg.chat.id) !== String(config.telegramChatId)) {
    warn(`Ignoring message from unauthorized chat ${msg.chat && msg.chat.id}`);
    return;
  }

  const [rawCmd, ...rest] = text.split(/\s+/);
  const cmd = rawCmd.toLowerCase().replace(/@.*$/, ''); // strip @botname
  const arg = rest.join(' ').trim();

  switch (cmd) {
    case '/start':
    case '/help':
      return send(helpText(), true);

    case '/skills':
      return send('Skills: ' + availableSkills().join(', '));

    case '/capture': {
      if (!arg) return send('Usage: /capture your note here');
      const date = appendCapture(arg);
      return send(`📝 Captured to your ${date} daily note.`);
    }

    case '/find': {
      if (!arg) return send('Usage: /find <niche>, <location>\nExample: /find boutique gyms, Miami');
      const queue = require('./mc/queue');
      let niche = arg;
      let location;
      if (arg.includes(',')) {
        const parts = arg.split(',');
        niche = parts[0].trim();
        location = parts.slice(1).join(',').trim();
      }
      const id = queue.enqueue('client-finder', { niche, count: 10, location }, 5);
      return send(
        `🔎 Queued lead pipeline #${id} for “${niche}”${location ? ` in ${location}` : ''}.\n` +
          'It runs when Mission Control is on (it auto-chains into research + drafts).'
      );
    }

    case '/status': {
      const dashboard = require('./mc/dashboard');
      return send('```\n' + dashboard.snapshot() + '\n```', true);
    }

    case '/brief':
    case '/morning':
      await send('🧠 Running your morning brief… (~1–2 min)');
      try {
        const r = await runSkill('morning-brief');
        return send('✅ Brief ready.\n\n' + clamp(r));
      } catch (e) {
        return send('❌ Brief failed: ' + e.message);
      }

    case '/process':
      await send('🗂️ Filing today’s captures…');
      try {
        const r = await runSkill('capture-processor');
        return send('✅ Filed.\n\n' + clamp(r, 2500));
      } catch (e) {
        return send('❌ ' + e.message);
      }

    case '/skill': {
      if (!arg || !availableSkills().includes(arg)) {
        return send('Unknown skill. Available: ' + availableSkills().join(', '));
      }
      await send(`▶️ Running ${arg}…`);
      try {
        const r = await runSkill(arg);
        return send('✅ Done.\n\n' + clamp(r));
      } catch (e) {
        return send('❌ ' + e.message);
      }
    }

    default:
      if (cmd.startsWith('/')) return send("Unrecognized command. Send /help.");
      // Plain text (no slash) → treat as a quick capture.
      const date = appendCapture(text);
      return send(`📝 Captured to your ${date} daily note. (Send /help for commands.)`);
  }
}

// ---- long-poll loop -------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function start() {
  if (!config.telegramBotToken || !config.telegramChatId) {
    warn('Telegram bot disabled: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set.');
    return;
  }
  log('Telegram control bot listening for commands.');
  await reply('🤖 Jarvis control bot online. Send /help.').catch(() => {});

  let offset = 0;
  // Skip any backlog so we don't replay old messages on restart.
  try {
    const init = await tg('getUpdates', { timeout: 0, offset: -1 });
    if (init && init.ok && init.result.length) {
      offset = init.result[init.result.length - 1].update_id + 1;
    }
  } catch {
    /* ignore */
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await tg('getUpdates', { timeout: 30, offset });
      if (res && res.ok) {
        for (const u of res.result) {
          offset = u.update_id + 1;
          const msg = u.message || u.edited_message;
          if (msg && msg.text) {
            handle(msg).catch((e) => error('bot handle error: ' + e.message));
          }
        }
      }
    } catch (e) {
      warn('bot poll error: ' + e.message);
      await sleep(3000);
    }
  }
}

module.exports = { start, handle, appendCapture, helpText };
