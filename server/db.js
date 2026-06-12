const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../dynasty_signals.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'follower',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trader_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT DEFAULT '',
    strategy TEXT DEFAULT '',
    verified INTEGER DEFAULT 0,
    subscription_price REAL DEFAULT 9.99,
    total_return REAL DEFAULT 0,
    win_rate REAL DEFAULT 0,
    trade_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    stripe_account_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trader_id INTEGER NOT NULL,
    asset TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('BUY','SELL','HOLD')),
    entry_price REAL,
    target_price REAL,
    stop_loss REAL,
    timeframe TEXT DEFAULT 'Swing',
    rationale TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','closed','cancelled')),
    result TEXT CHECK(result IN ('win','loss',NULL)),
    profit_loss_pct REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    FOREIGN KEY (trader_id) REFERENCES trader_profiles(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    trader_id INTEGER NOT NULL,
    tier TEXT DEFAULT 'basic',
    status TEXT DEFAULT 'active',
    price REAL NOT NULL,
    stripe_subscription_id TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ends_at DATETIME,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (trader_id) REFERENCES trader_profiles(id),
    UNIQUE(follower_id, trader_id)
  );

  CREATE TABLE IF NOT EXISTS profit_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    trader_id INTEGER NOT NULL,
    period TEXT NOT NULL,
    follower_gains REAL DEFAULT 0,
    platform_cut REAL DEFAULT 0,
    trader_cut REAL DEFAULT 0,
    paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (trader_id) REFERENCES trader_profiles(id)
  );
`);

// Seed demo data if empty
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
  );
  const insertProfile = db.prepare(
    `INSERT INTO trader_profiles (user_id, bio, strategy, verified, subscription_price, total_return, win_rate, trade_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertSignal = db.prepare(
    `INSERT INTO signals (trader_id, asset, action, entry_price, target_price, stop_loss, timeframe, rationale, status, result, profit_loss_pct)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const traders = [
    { email: 'alex@demo.com', name: 'Alex Rivera', bio: 'Former hedge fund analyst. 8 years trading equities and options.', strategy: 'Momentum + earnings plays on large-cap tech. I only enter with strong volume confirmation.', price: 29.99, ret: 142.3, wr: 72, trades: 89 },
    { email: 'jordan@demo.com', name: 'Jordan Lee', bio: 'Crypto & forex specialist. Swing trader focused on macro trends.', strategy: 'Multi-timeframe analysis. Always risk 1-2% per trade. Patient entries only.', price: 19.99, ret: 98.7, wr: 65, trades: 134 },
    { email: 'sam@demo.com', name: 'Sam Chen', bio: 'Algorithmic trader. Background in quantitative finance.', strategy: 'Mean-reversion strategies on S&P 500 components. Data-driven, no emotion.', price: 9.99, ret: 61.2, wr: 58, trades: 312 },
  ];

  const demoFollower = insertUser.run('follower@demo.com', hash, 'Demo User', 'follower');

  traders.forEach((t, i) => {
    const user = insertUser.run(t.email, hash, t.name, 'trader');
    const profile = insertProfile.run(user.lastInsertRowid, t.bio, t.strategy, 1, t.price, t.ret, t.wr, t.trades);
    const tid = profile.lastInsertRowid;

    const sampleSignals = [
      { asset: 'AAPL', action: 'BUY', entry: 182.5, target: 195.0, sl: 175.0, tf: 'Swing', rat: 'Strong earnings catalyst + golden cross on daily. Volume surge confirms breakout.', status: 'active', result: null, plpct: null },
      { asset: 'BTC/USD', action: 'BUY', entry: 42000, target: 48000, sl: 39000, tf: 'Position', rat: 'Institutional accumulation evident on chain. ETF inflows increasing.', status: 'closed', result: 'win', plpct: 14.3 },
      { asset: 'TSLA', action: 'SELL', entry: 245.0, target: 215.0, sl: 258.0, tf: 'Swing', rat: 'Bearish engulfing on weekly. Overextended after 30% rally with no fundamental catalyst.', status: 'closed', result: 'win', plpct: 12.2 },
      { asset: 'SPY', action: 'BUY', entry: 478.0, target: 495.0, sl: 470.0, tf: 'Day', rat: 'Fed pivot confirmed. Seasonality bullish. Support held at 200 EMA.', status: 'active', result: null, plpct: null },
    ];

    sampleSignals.slice(0, i + 2).forEach(s => {
      insertSignal.run(tid, s.asset, s.action, s.entry, s.target, s.sl, s.tf, s.rat, s.status, s.result, s.plpct);
    });
  });

  console.log('[DB] Demo data seeded. Login: alex@demo.com / password123');
}

module.exports = db;
