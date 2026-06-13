const express = require('express');
const db = require('../db');

const router = express.Router();

// Privacy: never expose follower emails. Show display name as "First L." only.
function privacyName(name) {
  const parts = String(name || '').trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return 'Member';
  const first = parts[0];
  const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : '';
  return first + lastInitial;
}

// Public community list of signal followers (social proof)
router.get('/', (req, res) => {
  // The official trader id, so the page can link to subscribe
  const official = db.prepare(`
    SELECT id FROM trader_profiles ORDER BY official DESC, total_return DESC LIMIT 1
  `).get();

  const rows = db.prepare(`
    SELECT u.id, u.name, u.created_at,
           COUNT(s.id) AS following
    FROM users u
    LEFT JOIN subscriptions s ON s.follower_id = u.id AND s.status = 'active'
    WHERE u.role = 'follower'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();

  const followers = rows.map(r => ({
    id: r.id,
    name: privacyName(r.name),
    initial: (r.name || 'M')[0].toUpperCase(),
    joined: (r.created_at || '').slice(0, 7),
    following: r.following,
  }));

  const subscribed = followers.filter(f => f.following > 0).length;

  res.json({
    officialTraderId: official ? official.id : null,
    total: followers.length,
    subscribed,
    followers,
  });
});

module.exports = router;
