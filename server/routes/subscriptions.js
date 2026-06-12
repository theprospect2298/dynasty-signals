const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get my subscriptions
router.get('/mine', requireAuth, (req, res) => {
  const subs = db.prepare(`
    SELECT s.*, tp.total_return, tp.win_rate, tp.trade_count, u.name as trader_name
    FROM subscriptions s
    JOIN trader_profiles tp ON s.trader_id = tp.id
    JOIN users u ON tp.user_id = u.id
    WHERE s.follower_id = ?
    ORDER BY s.started_at DESC
  `).all(req.user.id);
  res.json(subs);
});

// Subscribe to a trader (demo: no real payment, just record it)
router.post('/', requireAuth, (req, res) => {
  const { trader_id } = req.body;
  if (!trader_id) return res.status(400).json({ error: 'trader_id required' });

  const trader = db.prepare('SELECT * FROM trader_profiles WHERE id = ?').get(trader_id);
  if (!trader) return res.status(404).json({ error: 'Trader not found' });

  const existing = db.prepare(
    'SELECT * FROM subscriptions WHERE follower_id = ? AND trader_id = ?'
  ).get(req.user.id, trader_id);

  if (existing) {
    if (existing.status === 'active') {
      return res.status(409).json({ error: 'Already subscribed' });
    }
    // Reactivate
    db.prepare(
      "UPDATE subscriptions SET status = 'active', started_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(existing.id);
  } else {
    db.prepare(`
      INSERT INTO subscriptions (follower_id, trader_id, price, tier)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, trader_id, trader.subscription_price,
      trader.subscription_price >= 29.99 ? 'premium' :
      trader.subscription_price >= 19.99 ? 'pro' : 'basic');

    // Update follower count
    db.prepare('UPDATE trader_profiles SET followers_count = followers_count + 1 WHERE id = ?').run(trader_id);
  }

  res.json({ success: true, message: `Subscribed to trader for $${trader.subscription_price}/month` });
});

// Cancel subscription
router.delete('/:traderId', requireAuth, (req, res) => {
  const sub = db.prepare(
    "SELECT * FROM subscriptions WHERE follower_id = ? AND trader_id = ? AND status = 'active'"
  ).get(req.user.id, req.params.traderId);

  if (!sub) return res.status(404).json({ error: 'No active subscription found' });

  db.prepare("UPDATE subscriptions SET status = 'cancelled', ends_at = CURRENT_TIMESTAMP WHERE id = ?").run(sub.id);
  db.prepare('UPDATE trader_profiles SET followers_count = MAX(0, followers_count - 1) WHERE id = ?').run(req.params.traderId);

  res.json({ success: true });
});

// Check subscription status for a specific trader
router.get('/check/:traderId', requireAuth, (req, res) => {
  const sub = db.prepare(
    "SELECT * FROM subscriptions WHERE follower_id = ? AND trader_id = ? AND status = 'active'"
  ).get(req.user.id, req.params.traderId);
  res.json({ subscribed: !!sub, subscription: sub || null });
});

module.exports = router;
