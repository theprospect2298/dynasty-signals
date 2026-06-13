require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Real-time signal stream (SSE) — must be registered before the signals router
app.get('/api/signals/stream', require('./notifications').sseHandler);

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/traders', require('./routes/traders'));
app.use('/api/signals', require('./routes/signals'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/push', require('./routes/push'));
app.use('/api/track-record', require('./routes/stats'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Dynasty Signals' }));

// Uploaded chart screenshots
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend in production
const clientBuild = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuild));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Dynasty Signals running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);
});
