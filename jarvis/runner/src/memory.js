'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { config } = require('./config');

let db = null;

function init() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.memoryPath), { recursive: true });
  db = new Database(config.memoryPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tags TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_memory_tags ON memory(tags);
    CREATE INDEX IF NOT EXISTS idx_memory_created ON memory(created_at);
  `);
  return db;
}

// tags: array of strings or comma-separated string.
function store(tags, content) {
  init();
  const tagStr = Array.isArray(tags) ? tags.join(',') : String(tags || '');
  const stmt = db.prepare(
    'INSERT INTO memory (tags, content) VALUES (?, ?)'
  );
  const info = stmt.run(tagStr.toLowerCase(), String(content));
  return info.lastInsertRowid;
}

// Return most recent entries whose tags contain the given tag substring.
function search(tag, limit = 7) {
  init();
  const stmt = db.prepare(
    `SELECT id, tags, content, created_at
       FROM memory
      WHERE tags LIKE ?
   ORDER BY id DESC
      LIMIT ?`
  );
  return stmt.all(`%${String(tag).toLowerCase()}%`, limit);
}

function recent(limit = 20) {
  init();
  const stmt = db.prepare(
    `SELECT id, tags, content, created_at
       FROM memory
   ORDER BY id DESC
      LIMIT ?`
  );
  return stmt.all(limit);
}

module.exports = { init, store, search, recent };
