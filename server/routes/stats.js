const express = require('express');
const db = require('../db');

const router = express.Router();

// Public track record for the official trader
router.get('/', (req, res) => {
  const trader = db.prepare(`
    SELECT tp.id, tp.bio, tp.strategy, tp.verified, tp.official, tp.subscription_price,
           tp.total_return, tp.win_rate, tp.trade_count, tp.followers_count, u.name
    FROM trader_profiles tp
    JOIN users u ON tp.user_id = u.id
    ORDER BY tp.official DESC, tp.total_return DESC
    LIMIT 1
  `).get();

  if (!trader) return res.status(404).json({ error: 'No trader found' });

  const closed = db.prepare(`
    SELECT id, asset, action, entry_price, target_price, stop_loss, timeframe,
           result, profit_loss_pct, created_at, closed_at
    FROM signals
    WHERE trader_id = ? AND status = 'closed' AND result IS NOT NULL
    ORDER BY COALESCE(closed_at, created_at) ASC
  `).all(trader.id);

  // Equity curve: cumulative sum of P/L%
  let equity = 0;
  const curve = closed.map(s => {
    equity += s.profit_loss_pct || 0;
    return {
      date: (s.closed_at || s.created_at || '').slice(0, 10),
      equity: Math.round(equity * 100) / 100,
      asset: s.asset,
      pl: s.profit_loss_pct,
    };
  });

  // Monthly aggregates
  const monthlyMap = new Map();
  for (const s of closed) {
    const month = (s.closed_at || s.created_at || '').slice(0, 7);
    if (!month) continue;
    if (!monthlyMap.has(month)) monthlyMap.set(month, { month, pl: 0, trades: 0, wins: 0 });
    const m = monthlyMap.get(month);
    m.pl += s.profit_loss_pct || 0;
    m.trades += 1;
    if (s.result === 'win') m.wins += 1;
  }
  const monthly = [...monthlyMap.values()].map(m => ({ ...m, pl: Math.round(m.pl * 100) / 100 }));

  // Headline stats
  const wins = closed.filter(s => s.result === 'win');
  const losses = closed.filter(s => s.result === 'loss');
  const sumWins = wins.reduce((a, s) => a + (s.profit_loss_pct || 0), 0);
  const sumLosses = losses.reduce((a, s) => a + (s.profit_loss_pct || 0), 0);
  const pls = closed.map(s => s.profit_loss_pct || 0);

  let streak = 0;
  for (let i = closed.length - 1; i >= 0; i--) {
    if (closed[i].result === 'win') streak++;
    else break;
  }

  const stats = {
    totalTrades: closed.length,
    winRate: closed.length ? Math.round((wins.length / closed.length) * 100) : 0,
    totalReturn: Math.round(equity * 100) / 100,
    avgWin: wins.length ? Math.round((sumWins / wins.length) * 100) / 100 : 0,
    avgLoss: losses.length ? Math.round((sumLosses / losses.length) * 100) / 100 : 0,
    bestTrade: pls.length ? Math.max(...pls) : 0,
    worstTrade: pls.length ? Math.min(...pls) : 0,
    profitFactor: sumLosses !== 0 ? Math.round((sumWins / Math.abs(sumLosses)) * 100) / 100 : null,
    winStreak: streak,
  };

  res.json({
    trader,
    stats,
    curve,
    monthly,
    trades: [...closed].reverse(),
  });
});

module.exports = router;
