const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const OWNER_EMAIL = 'cjventura229822@yahoo.com';
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Everyone registers as a follower — only the owner can be a trader
  const role = 'follower';

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).run(email.toLowerCase().trim(), hash, name.trim(), role);

    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let profile = null;
  if (user.role === 'trader') {
    profile = db.prepare('SELECT * FROM trader_profiles WHERE user_id = ?').get(user.id);
  }

  res.json({ user, profile });
});

// Change password (logged in)
router.post('/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(current_password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

  const hash = await bcrypt.hash(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  res.json({ success: true });
});

// Request a password reset email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const { sendEmail, emailEnabled, emailShell } = require('../notifications');
  if (!emailEnabled()) {
    return res.status(503).json({ error: 'Password reset emails are not configured on this server yet. Contact support.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

  // Always respond success — never reveal whether an email is registered
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)')
      .run(user.id, sha256(token), Date.now() + 60 * 60 * 1000);

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}`;
    sendEmail(user.email, 'Reset your Dynasty Signals password', emailShell(`
      <p style="margin:0 0 12px;color:#ffffff;font-size:20px;font-weight:800">Reset your password</p>
      <p style="margin:0 0 20px;color:#94a3b8;font-size:13px;line-height:1.6">We received a request to reset the password for ${user.email}. This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      <a href="${link}" style="display:block;background:#14b8a6;color:#ffffff;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:14px">Choose a New Password →</a>
    `)).catch(err => console.error('[auth] reset email failed:', err.message));
  }

  res.json({ success: true, message: 'If that email is registered, a reset link is on its way.' });
});

// Complete a password reset
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'Token and new password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const row = db.prepare('SELECT * FROM password_resets WHERE token_hash = ?').get(sha256(token));
  if (!row || row.used || row.expires_at < Date.now()) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired. Request a new one.' });
  }

  const hash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(row.id);
  res.json({ success: true });
});

module.exports = router;
