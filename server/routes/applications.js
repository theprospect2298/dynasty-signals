const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const OWNER_EMAIL = 'cjventura229822@yahoo.com';

const PROOF_TYPES = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
  'application/pdf': 'pdf', 'text/csv': 'csv',
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (PROOF_TYPES[file.mimetype]) cb(null, true);
    else cb(new Error('Proof files must be PNG, JPG, WEBP, GIF, PDF, or CSV'));
  },
});

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Submit a signal-provider application (public)
router.post('/', (req, res) => {
  upload.array('proof', 6)(req, res, async (uploadErr) => {
    if (uploadErr) return res.status(400).json({ error: uploadErr.message });

    const b = req.body || {};
    if (!b.name || !b.email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    if (!b.win_rate || !b.avg_expectancy) {
      return res.status(400).json({ error: 'Win rate and average expectancy are required' });
    }
    if (!b.track_record_url && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: 'Provide a track-record link or upload proof of your last 3 months of trades' });
    }

    // Save uploaded proof files
    const proofUrls = [];
    if (req.files && req.files.length) {
      const dir = path.join(__dirname, '../uploads/applications');
      fs.mkdirSync(dir, { recursive: true });
      for (const f of req.files) {
        const ext = PROOF_TYPES[f.mimetype];
        const fn = `${crypto.randomBytes(8).toString('hex')}.${ext}`;
        fs.writeFileSync(path.join(dir, fn), f.buffer);
        proofUrls.push(`/uploads/applications/${fn}`);
      }
    }

    const result = db.prepare(`
      INSERT INTO provider_applications
        (name, email, markets, experience_years, win_rate, avg_expectancy, avg_rr,
         max_drawdown, risk_per_trade, track_record_url, strategy, why, proof_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      b.name.trim(), b.email.trim(), b.markets || '', b.experience_years || '',
      b.win_rate || '', b.avg_expectancy || '', b.avg_rr || '', b.max_drawdown || '',
      b.risk_per_trade || '', b.track_record_url || '', b.strategy || '', b.why || '',
      proofUrls.join(',')
    );

    // Notify the owner by email (best-effort)
    try {
      const { sendEmail, emailEnabled, emailShell } = require('../notifications');
      if (emailEnabled()) {
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const row = (label, val) => val ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:12px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#e2e8f0;font-size:13px">${esc(val)}</td></tr>` : '';
        const proofLinks = proofUrls.length
          ? proofUrls.map((u, i) => `<a href="${appUrl}${u}" style="color:#2dd4bf">Proof ${i + 1}</a>`).join(' &nbsp;·&nbsp; ')
          : '—';
        sendEmail(OWNER_EMAIL, `📥 New signal-provider application — ${b.name}`, emailShell(`
          <p style="margin:0 0 4px;color:#2dd4bf;font-size:12px;font-weight:700;letter-spacing:2px">NEW PROVIDER APPLICATION</p>
          <p style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800">${esc(b.name)}</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            ${row('Email', b.email)}
            ${row('Markets', b.markets)}
            ${row('Experience', b.experience_years)}
            ${row('Win rate', b.win_rate)}
            ${row('Avg expectancy', b.avg_expectancy)}
            ${row('Avg R:R', b.avg_rr)}
            ${row('Max drawdown', b.max_drawdown)}
            ${row('Risk/trade', b.risk_per_trade)}
            ${row('Track record', b.track_record_url)}
            ${row('Strategy', b.strategy)}
            ${row('Why', b.why)}
          </table>
          <p style="margin:0 0 16px;color:#94a3b8;font-size:13px">Proof (last 3 months): ${proofLinks}</p>
          <a href="${appUrl}/admin/applications" style="display:block;background:#14b8a6;color:#fff;text-decoration:none;text-align:center;padding:12px;border-radius:10px;font-weight:700;font-size:14px">Review in Admin →</a>
        `)).catch(e => console.error('[applications] owner email failed:', e.message));
      }
    } catch (e) { console.error('[applications]', e.message); }

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  });
});

// Owner-only: list applications
router.get('/', requireAuth, (req, res) => {
  if (req.user.email !== OWNER_EMAIL) return res.status(403).json({ error: 'Forbidden' });
  const apps = db.prepare('SELECT * FROM provider_applications ORDER BY created_at DESC').all()
    .map(a => ({ ...a, proof_urls: a.proof_urls ? a.proof_urls.split(',').filter(Boolean) : [] }));
  res.json(apps);
});

// Owner-only: update application status
router.put('/:id/status', requireAuth, (req, res) => {
  if (req.user.email !== OWNER_EMAIL) return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body || {};
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE provider_applications SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

module.exports = router;
