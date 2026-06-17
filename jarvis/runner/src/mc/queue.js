'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { config } = require('../config');

let db = null;

function init() {
  if (db) return db;
  fs.mkdirSync(path.dirname(config.mc.dbPath), { recursive: true });
  db = new Database(config.mc.dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      worker TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      priority INTEGER NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'queued',
      result TEXT,
      error TEXT,
      cost_usd REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      started_at TEXT,
      finished_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  `);
  return db;
}

function enqueue(worker, payload = {}, priority = 5) {
  init();
  const info = db
    .prepare('INSERT INTO tasks (worker, payload, priority) VALUES (?, ?, ?)')
    .run(worker, JSON.stringify(payload), priority);
  return info.lastInsertRowid;
}

// Atomically claim the next queued task (highest priority, then oldest).
function claimNext() {
  init();
  const tx = db.transaction(() => {
    const row = db
      .prepare(
        `SELECT * FROM tasks WHERE status = 'queued'
           ORDER BY priority DESC, id ASC LIMIT 1`
      )
      .get();
    if (!row) return null;
    db.prepare(
      `UPDATE tasks SET status = 'running', started_at = datetime('now') WHERE id = ?`
    ).run(row.id);
    return row;
  });
  const row = tx();
  if (row) row.payload = safeParse(row.payload);
  return row;
}

function complete(id, result, costUsd = 0) {
  init();
  db.prepare(
    `UPDATE tasks SET status = 'done', result = ?, cost_usd = ?,
       finished_at = datetime('now') WHERE id = ?`
  ).run(String(result || '').slice(0, 8000), costUsd, id);
}

function fail(id, errMsg, costUsd = 0) {
  init();
  db.prepare(
    `UPDATE tasks SET status = 'failed', error = ?, cost_usd = ?,
       finished_at = datetime('now') WHERE id = ?`
  ).run(String(errMsg || '').slice(0, 2000), costUsd, id);
}

function counts() {
  init();
  const rows = db
    .prepare(`SELECT status, COUNT(*) n FROM tasks GROUP BY status`)
    .all();
  const out = { queued: 0, running: 0, done: 0, failed: 0 };
  for (const r of rows) out[r.status] = r.n;
  return out;
}

function running() {
  init();
  return db
    .prepare(`SELECT * FROM tasks WHERE status = 'running' ORDER BY started_at ASC`)
    .all();
}

function recent(limit = 8) {
  init();
  return db
    .prepare(
      `SELECT * FROM tasks WHERE status IN ('done','failed')
         ORDER BY finished_at DESC LIMIT ?`
    )
    .all(limit);
}

// Total estimated spend for the current local day.
function todayCost() {
  init();
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(cost_usd), 0) c FROM tasks
         WHERE finished_at IS NOT NULL
           AND date(finished_at) = date('now', 'localtime')`
    )
    .get();
  return row.c || 0;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

module.exports = {
  init,
  enqueue,
  claimNext,
  complete,
  fail,
  counts,
  running,
  recent,
  todayCost,
};
