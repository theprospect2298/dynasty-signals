'use strict';

const fs = require('fs');
const path = require('path');
const { config } = require('../config');
const queue = require('./queue');

function elapsed(startedAt) {
  if (!startedAt) return '';
  const ms = Date.now() - new Date(startedAt + 'Z').getTime();
  const s = Math.max(0, Math.round(ms / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${s % 60}s`;
}

// Build a compact text snapshot of the system state.
function snapshot() {
  const c = queue.counts();
  const running = queue.running();
  const recent = queue.recent(6);
  const spent = queue.todayCost();
  const budget = config.mc.dailyBudgetUsd;

  const lines = [];
  lines.push('╔══════════════════ MISSION CONTROL ══════════════════');
  lines.push(
    `║ queued ${c.queued}  │ running ${c.running}/${config.mc.maxConcurrent}  │ done ${c.done}  │ failed ${c.failed}`
  );
  lines.push(
    `║ spend today ~$${spent.toFixed(2)} / $${budget.toFixed(2)} budget` +
      (config.mc.dryRun ? '   [DRY RUN]' : '')
  );
  lines.push('╠══ running ══════════════════════════════════════════');
  if (running.length === 0) lines.push('║ (idle — no active workers)');
  for (const t of running) {
    lines.push(`║ ▶ #${t.id} d${t.depth} ${t.worker}  ${elapsed(t.started_at)}  ${payloadHint(t)}`);
  }
  lines.push('╠══ recent ═══════════════════════════════════════════');
  if (recent.length === 0) lines.push('║ (nothing finished yet)');
  for (const t of recent) {
    const mark = t.status === 'done' ? '✓' : '✗';
    lines.push(`║ ${mark} #${t.id} d${t.depth} ${t.worker}  $${(t.cost_usd || 0).toFixed(3)}  ${payloadHint(t)}`);
  }
  lines.push('╚═════════════════════════════════════════════════════');
  return lines.join('\n');
}

function payloadHint(t) {
  let p = t.payload;
  if (typeof p === 'string') {
    try {
      p = JSON.parse(p);
    } catch {
      p = {};
    }
  }
  const bits = [p.niche, p.brand, p.location].filter(Boolean);
  return bits.length ? `(${bits.join(', ')})` : '';
}

// Print to console (clearing first for a live feel).
function render() {
  const out = snapshot();
  process.stdout.write('\x1b[2J\x1b[H');
  process.stdout.write(out + '\n');
  writeStatusFile(out);
}

function writeStatusFile(text) {
  try {
    fs.mkdirSync(path.dirname(config.mc.statusFile), { recursive: true });
    const stamp = new Date().toISOString();
    fs.writeFileSync(
      config.mc.statusFile,
      `# Mission Control — status\n\nUpdated: ${stamp}\n\n\`\`\`\n${text}\n\`\`\`\n`,
      'utf8'
    );
  } catch {
    /* status file is best-effort */
  }
}

module.exports = { snapshot, render };
