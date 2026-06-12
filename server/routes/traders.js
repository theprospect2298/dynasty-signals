const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// List all verified traders (public)
router.get('/', (req, res) => {
  const traders = db.prepare(`
    SELECT tp.id, tp.bio, tp.strategy, tp.verified, tp.subscription_price,
           tp.total_return, tp.win_rate, tp.trade_count, tp.followers_count,
           u.name, u.email
    FROM trader_profiles tp
    JOIN users u ON tp.user_id = u.id
    ORDER BY tp.total_return DESC
  `).all();
  res.json(traders);
});

// Get single trader profile (public)
router.get('/:id', (req, res) => {
  const trader = db.prepare(`
    SELECT tp.*, u.name, u.email, u.created_at as member_since
    FROM trader_profiles tp
    JOIN users u ON tp.user_id = u.id
    WHERE tp.id = ?
  `).get(req.params.id);

  if (!trader) return res.status(404).json({ error: 'Trader not found' });

  const recentSignals = db.prepare(`
    SELECT * FROM signals WHERE trader_id = ?
    ORDER BY created_at DESC LIMIT 10
  `).all(req.params.id);

  res.json({ trader, recentSignals });
});

// Update trader profile (trader only)
router.put('/profile', ...requireRole('trader'), (req, res) => {
  const { bio, strategy, subscription_price } = req.body;
  const profile = db.prepare('SELECT id FROM trader_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const validPrices = [9.99, 19.99, 29.99];
  const price = validPrices.includes(Number(subscription_price)) ? Number(subscription_price) : undefined;

  db.prepare(`
    UPDATE trader_profiles SET
      bio = COALESCE(?, bio),
      strategy = COALESCE(?, strategy),
      subscription_price = COALESCE(?, subscription_price)
    WHERE user_id = ?
  `).run(bio || null, strategy || null, price || null, req.user.id);

  const updated = db.prepare('SELECT * FROM trader_profiles WHERE user_id = ?').get(req.user.id);
  res.json(updated);
});

// Get trader's own stats
router.get('/me/stats', ...requireRole('trader'), (req, res) => {
  const profile = db.prepare('SELECT * FROM trader_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  const signals = db.prepare('SELECT * FROM signals WHERE trader_id = ? ORDER BY created_at DESC').all(profile.id);
  const subs = db.prepare(`
    SELECT s.*, u.name as follower_name, u.email as follower_email
    FROM subscriptions s
    JOIN users u ON s.follower_id = u.id
    WHERE s.trader_id = ? AND s.status = 'active'
  `).all(profile.id);

  const closed = signals.filter(s => s.status === 'closed');
  const wins = closed.filter(s => s.result === 'win').length;
  const wr = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0;
  const avgReturn = closed.length > 0
    ? (closed.reduce((sum, s) => sum + (s.profit_loss_pct || 0), 0) / closed.length).toFixed(1)
    : 0;

  res.json({ profile, signals, subscribers: subs, stats: { winRate: wr, avgReturn, totalTrades: closed.length, activeSubs: subs.length } });
});

module.exports = router;
