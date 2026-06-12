const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const webpush = require('web-push');
const db = require('./db');
const { JWT_SECRET } = require('./middleware/auth');

// ── SSE registry: userId -> Set of open responses ──────────────────────────
const clients = new Map();

function addClient(userId, res) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId).add(res);
}

function removeClient(userId, res) {
  const set = clients.get(userId);
  if (set) {
    set.delete(res);
    if (set.size === 0) clients.delete(userId);
  }
}

// GET /api/signals/stream?token=JWT — EventSource can't set headers,
// so the token rides in the query string
function sseHandler(req, res) {
  let payload;
  try {
    payload = jwt.verify(req.query.token || '', JWT_SECRET);
  } catch {
    return res.status(401).end();
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();
  res.write(':connected\n\n');

  addClient(payload.id, res);
  const heartbeat = setInterval(() => {
    try { res.write(':hb\n\n'); } catch { /* closed */ }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(payload.id, res);
  });
}

function sendToUsers(userIds, data) {
  const line = `data: ${JSON.stringify(data)}\n\n`;
  for (const id of userIds) {
    const set = clients.get(id);
    if (set) for (const res of set) {
      try { res.write(line); } catch { /* ignore broken pipe */ }
    }
  }
}

// ── Web Push (VAPID) ────────────────────────────────────────────────────────
// Keys come from env, or are generated once and persisted to server/vapid.json
function initVapid() {
  let pub = process.env.VAPID_PUBLIC_KEY;
  let priv = process.env.VAPID_PRIVATE_KEY;
  const file = path.join(__dirname, 'vapid.json');

  if (!pub || !priv) {
    try {
      const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
      pub = saved.publicKey;
      priv = saved.privateKey;
    } catch {
      const keys = webpush.generateVAPIDKeys();
      pub = keys.publicKey;
      priv = keys.privateKey;
      try { fs.writeFileSync(file, JSON.stringify(keys, null, 2)); } catch { /* read-only fs */ }
      console.log('[notify] Generated new VAPID keys -> server/vapid.json');
    }
  }

  webpush.setVapidDetails(
    'mailto:' + (process.env.VAPID_CONTACT || 'admin@dynastysignals.app'),
    pub, priv
  );
  return pub;
}

const VAPID_PUBLIC_KEY = initVapid();

async function sendPush(userIds, payload) {
  if (userIds.length === 0) return;
  const qs = userIds.map(() => '?').join(',');
  const subs = db.prepare(`SELECT * FROM push_subscriptions WHERE user_id IN (${qs})`).all(...userIds);
  const body = JSON.stringify(payload);

  await Promise.allSettled(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        body
      );
    } catch (err) {
      // Subscription expired or revoked — clean it up
      if (err.statusCode === 404 || err.statusCode === 410) {
        db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(s.id);
      }
    }
  }));
}

// ── Email (SMTP via nodemailer — skipped gracefully if not configured) ─────
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  const nodemailer = require('nodemailer');
  const port = Number(process.env.SMTP_PORT || 587);
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  console.log('[notify] SMTP email enabled via', process.env.SMTP_HOST);
} else {
  console.log('[notify] SMTP not configured — email notifications disabled (set SMTP_HOST/SMTP_USER/SMTP_PASS)');
}

function fmt(n) {
  return n == null ? '—' : '$' + Number(n).toLocaleString();
}

function emailHtml(signal, traderName, appUrl) {
  const isBuy = signal.action === 'BUY';
  const accent = isBuy ? '#22c55e' : signal.action === 'SELL' ? '#ef4444' : '#eab308';
  return `
  <div style="background:#02070b;padding:32px 16px;font-family:Segoe UI,Arial,sans-serif">
    <div style="max-width:480px;margin:0 auto;background:#071018;border:1px solid #1d2f3d;border-radius:16px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid #15222e">
        <span style="color:#ffffff;font-size:18px;font-weight:800">Dynasty <span style="color:#2dd4bf">Signals</span></span>
      </div>
      <div style="padding:24px">
        <p style="margin:0 0 4px;color:#2dd4bf;font-size:12px;font-weight:700;letter-spacing:2px">🚨 NEW SIGNAL FROM ${traderName.toUpperCase()}</p>
        <p style="margin:0 0 20px;color:#ffffff;font-size:28px;font-weight:900">
          ${signal.asset}
          <span style="color:${accent};font-size:20px;margin-left:8px">● ${signal.action}</span>
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr>
            <td style="padding:10px;background:#0d1822;border-radius:8px;text-align:center">
              <p style="margin:0;color:#64748b;font-size:11px">ENTRY</p>
              <p style="margin:4px 0 0;color:#ffffff;font-size:15px;font-weight:700">${fmt(signal.entry_price)}</p>
            </td>
            <td style="width:8px"></td>
            <td style="padding:10px;background:#0d1822;border-radius:8px;text-align:center">
              <p style="margin:0;color:#64748b;font-size:11px">TARGET</p>
              <p style="margin:4px 0 0;color:#22c55e;font-size:15px;font-weight:700">${fmt(signal.target_price)}</p>
            </td>
            <td style="width:8px"></td>
            <td style="padding:10px;background:#0d1822;border-radius:8px;text-align:center">
              <p style="margin:0;color:#64748b;font-size:11px">STOP LOSS</p>
              <p style="margin:4px 0 0;color:#ef4444;font-size:15px;font-weight:700">${fmt(signal.stop_loss)}</p>
            </td>
          </tr>
        </table>
        ${signal.rationale ? `<p style="margin:0 0 20px;color:#94a3b8;font-size:13px;line-height:1.6;border-left:3px solid #2dd4bf;padding-left:12px">${signal.rationale}</p>` : ''}
        <a href="${appUrl}/feed" style="display:block;background:#14b8a6;color:#ffffff;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14px">View Signal in App →</a>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #15222e">
        <p style="margin:0;color:#475569;font-size:10px;line-height:1.5">For informational purposes only. Not financial advice. Trading involves substantial risk of loss. Past performance does not guarantee future results.</p>
      </div>
    </div>
  </div>`;
}

async function sendEmails(recipients, signal, traderName) {
  if (!transporter) return;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const subject = `🚨 ${signal.action} ${signal.asset} — New signal from ${traderName}`;
  const html = emailHtml(signal, traderName, appUrl);

  await Promise.allSettled(recipients.map(r =>
    transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: r.email,
      subject,
      html,
    })
  ));
  console.log(`[notify] Emailed ${recipients.length} subscriber(s) about ${signal.asset}`);
}

// ── Main entry: fan out a freshly published signal ──────────────────────────
async function notifyNewSignal(signal, traderProfileId, trader) {
  const subs = db.prepare(`
    SELECT u.id, u.email, u.name
    FROM subscriptions s
    JOIN users u ON s.follower_id = u.id
    WHERE s.trader_id = ? AND s.status = 'active' AND u.id != ?
  `).all(traderProfileId, trader.id);

  if (subs.length === 0) return;
  const ids = subs.map(s => s.id);

  // 1. Live popup for users with the app open
  sendToUsers(ids, { type: 'signal', signal, traderName: trader.name, traderProfileId });

  // 2. Browser push for everyone else
  const pieces = [];
  if (signal.entry_price) pieces.push(`Entry ${fmt(signal.entry_price)}`);
  if (signal.target_price) pieces.push(`Target ${fmt(signal.target_price)}`);
  if (signal.stop_loss) pieces.push(`Stop ${fmt(signal.stop_loss)}`);
  sendPush(ids, {
    title: `🚨 ${signal.action} ${signal.asset} — ${trader.name}`,
    body: pieces.join(' · ') || 'New trade signal published',
    url: `/signals/${traderProfileId}`,
  }).catch(err => console.error('[notify] push error:', err.message));

  // 3. Email
  sendEmails(subs, signal, trader.name).catch(err => console.error('[notify] email error:', err.message));
}

module.exports = { sseHandler, notifyNewSignal, VAPID_PUBLIC_KEY };
