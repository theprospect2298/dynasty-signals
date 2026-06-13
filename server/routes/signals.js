const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES[file.mimetype]) cb(null, true);
    else cb(new Error('Only PNG, JPG, WEBP, or GIF images are allowed'));
  },
});

// Get signals feed for subscriber (requires active subscription)
router.get('/feed', requireAuth, (req, res) => {
  const { trader_id } = req.query;

  if (trader_id) {
    // Check subscription
    const sub = db.prepare(`
      SELECT * FROM subscriptions
      WHERE follower_id = ? AND trader_id = ? AND status = 'active'
    `).get(req.user.id, trader_id);

    if (!sub && req.user.role !== 'trader') {
      // Allow traders to see their own signals
      const ownProfile = db.prepare('SELECT id FROM trader_profiles WHERE user_id = ?').get(req.user.id);
      if (!ownProfile || ownProfile.id !== Number(trader_id)) {
        return res.status(403).json({ error: 'Subscription required to view this trader\'s signals' });
      }
    }

    const signals = db.prepare(`
      SELECT s.*, tp.user_id, u.name as trader_name
      FROM signals s
      JOIN trader_profiles tp ON s.trader_id = tp.id
      JOIN users u ON tp.user_id = u.id
      WHERE s.trader_id = ?
      ORDER BY s.created_at DESC
    `).all(trader_id);

    return res.json(signals);
  }

  // Get all signals from subscribed traders
  const signals = db.prepare(`
    SELECT s.*, u.name as trader_name, tp.id as trader_profile_id
    FROM signals s
    JOIN trader_profiles tp ON s.trader_id = tp.id
    JOIN users u ON tp.user_id = u.id
    WHERE s.trader_id IN (
      SELECT trader_id FROM subscriptions
      WHERE follower_id = ? AND status = 'active'
    )
    ORDER BY s.created_at DESC
    LIMIT 50
  `).all(req.user.id);

  res.json(signals);
});

// Preview signals (limited, for non-subscribers)
router.get('/preview/:traderId', (req, res) => {
  const signals = db.prepare(`
    SELECT s.id, s.asset, s.action, s.timeframe, s.status, s.result, s.profit_loss_pct, s.created_at
    FROM signals s
    WHERE s.trader_id = ? AND s.status = 'closed'
    ORDER BY s.created_at DESC
    LIMIT 5
  `).all(req.params.traderId);

  res.json(signals);
});

// Upload a chart screenshot → AI extracts asset/entry/stop/target (trader only)
router.post('/parse-screenshot', ...requireRole('trader'), (req, res) => {
  upload.single('screenshot')(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ error: uploadErr.message });
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    // Save the image so it can be attached to the published signal
    const ext = IMAGE_TYPES[req.file.mimetype];
    const filename = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const uploadsDir = path.join(__dirname, '../uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer);
    const screenshot_url = `/uploads/${filename}`;

    try {
      const { extractTradeFromImage } = require('../vision');
      const parsed = await extractTradeFromImage(req.file.buffer, req.file.mimetype);
      res.json({ ...parsed, screenshot_url });
    } catch (err) {
      if (err.code === 'NO_API_KEY') {
        return res.status(503).json({ error: err.message, screenshot_url });
      }
      console.error('[vision] parse failed:', err.message);
      res.status(502).json({ error: 'Could not read the chart — the screenshot is attached, fill the fields manually.', screenshot_url });
    }
  });
});

// Publish a new signal (trader only)
router.post('/', ...requireRole('trader'), (req, res) => {
  const { asset, action, entry_price, target_price, stop_loss, timeframe, rationale, screenshot_url } = req.body;

  if (!asset || !action) {
    return res.status(400).json({ error: 'Asset and action are required' });
  }
  if (!['BUY', 'SELL', 'HOLD'].includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Action must be BUY, SELL, or HOLD' });
  }

  const profile = db.prepare('SELECT id FROM trader_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Trader profile not found' });

  // Only accept screenshots that came through our own upload endpoint
  const safeScreenshot = typeof screenshot_url === 'string' && /^\/uploads\/[a-f0-9]+\.(png|jpg|webp|gif)$/.test(screenshot_url)
    ? screenshot_url : null;

  const result = db.prepare(`
    INSERT INTO signals (trader_id, asset, action, entry_price, target_price, stop_loss, timeframe, rationale, screenshot_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(profile.id, asset.toUpperCase(), action.toUpperCase(), entry_price || null, target_price || null, stop_loss || null, timeframe || 'Swing', rationale || '', safeScreenshot);

  const signal = db.prepare('SELECT * FROM signals WHERE id = ?').get(result.lastInsertRowid);

  // Fan out: live popup (SSE) + browser push + email to all active subscribers
  const { notifyNewSignal } = require('../notifications');
  notifyNewSignal(signal, profile.id, req.user).catch(err => console.error('[notify]', err.message));

  res.status(201).json(signal);
});

// Close/update a signal (trader only)
router.put('/:id/close', ...requireRole('trader'), (req, res) => {
  const { result, profit_loss_pct } = req.body;

  if (!['win', 'loss'].includes(result)) {
    return res.status(400).json({ error: 'Result must be win or loss' });
  }

  const profile = db.prepare('SELECT id FROM trader_profiles WHERE user_id = ?').get(req.user.id);
  const signal = db.prepare('SELECT * FROM signals WHERE id = ? AND trader_id = ?').get(req.params.id, profile.id);

  if (!signal) return res.status(404).json({ error: 'Signal not found or not yours' });
  if (signal.status !== 'active') return res.status(400).json({ error: 'Signal already closed' });

  db.prepare(`
    UPDATE signals SET status = 'closed', result = ?, profit_loss_pct = ?, closed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(result, profit_loss_pct || null, req.params.id);

  // Recalculate trader stats
  const closedSignals = db.prepare(`
    SELECT result, profit_loss_pct FROM signals
    WHERE trader_id = ? AND status = 'closed'
  `).all(profile.id);

  const wins = closedSignals.filter(s => s.result === 'win').length;
  const winRate = closedSignals.length > 0 ? Math.round((wins / closedSignals.length) * 100) : 0;
  const totalReturn = closedSignals.reduce((sum, s) => sum + (s.profit_loss_pct || 0), 0);

  db.prepare(`
    UPDATE trader_profiles SET win_rate = ?, total_return = ?, trade_count = ?
    WHERE id = ?
  `).run(winRate, Math.round(totalReturn * 10) / 10, closedSignals.length, profile.id);

  const updated = db.prepare('SELECT * FROM signals WHERE id = ?').get(req.params.id);

  // Fan out the result: live popup + push + email + Telegram
  const { notifySignalClosed } = require('../notifications');
  notifySignalClosed(updated, profile.id, req.user).catch(err => console.error('[notify]', err.message));

  res.json(updated);
});

// Cancel a signal
router.put('/:id/cancel', ...requireRole('trader'), (req, res) => {
  const profile = db.prepare('SELECT id FROM trader_profiles WHERE user_id = ?').get(req.user.id);
  const signal = db.prepare('SELECT * FROM signals WHERE id = ? AND trader_id = ?').get(req.params.id, profile.id);

  if (!signal) return res.status(404).json({ error: 'Signal not found' });

  db.prepare(`UPDATE signals SET status = 'cancelled', closed_at = CURRENT_TIMESTAMP WHERE id = ?`).run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
