'use strict';

const fs = require('fs');
const path = require('path');
const { config } = require('../config');

const TEXT_EXT = new Set([
  '.md', '.markdown', '.txt', '.json', '.csv', '.yaml', '.yml', '.org',
]);

// Resolve a vault-relative path and guarantee it stays inside the vault.
function resolveInVault(relPath) {
  const cleaned = String(relPath || '').replace(/^[/\\]+/, '');
  const abs = path.resolve(config.vaultPath, cleaned);
  const root = path.resolve(config.vaultPath);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    throw new Error(`Path escapes the vault: ${relPath}`);
  }
  return abs;
}

function relOf(abs) {
  return path.relative(config.vaultPath, abs) || '.';
}

function assertWritable(abs) {
  if (config.writeScope === 'vault') return;
  // outputs-only: restrict writes to 04-JARVIS-OUTPUTS
  const outputs = path.resolve(config.vaultPath, '04-JARVIS-OUTPUTS');
  if (abs !== outputs && !abs.startsWith(outputs + path.sep)) {
    throw new Error(
      `WRITE_SCOPE=outputs-only: refusing to write outside 04-JARVIS-OUTPUTS (${relOf(abs)})`
    );
  }
}

function listDirectory(relPath = '.') {
  const abs = resolveInVault(relPath);
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  return entries
    .filter((e) => !e.name.startsWith('.'))
    .map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'dir' : 'file',
      path: relOf(path.join(abs, e.name)),
    }));
}

function readFile(relPath) {
  const abs = resolveInVault(relPath);
  return fs.readFileSync(abs, 'utf8');
}

function writeFile(relPath, content) {
  const abs = resolveInVault(relPath);
  assertWritable(abs);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content, 'utf8');
  return relOf(abs);
}

function appendFile(relPath, content) {
  const abs = resolveInVault(relPath);
  assertWritable(abs);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.appendFileSync(abs, content, 'utf8');
  return relOf(abs);
}

// Recursively walk the vault, skipping dotfiles, the memory db, and node_modules.
function walk(absDir, out) {
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const abs = path.join(absDir, e.name);
    if (e.isDirectory()) {
      walk(abs, out);
    } else {
      out.push(abs);
    }
  }
}

function allFiles() {
  const out = [];
  walk(config.vaultPath, out);
  return out;
}

// Files modified within the last `hours`, newest first.
function recentFiles(hours = 48) {
  const cutoff = Date.now() - hours * 3600 * 1000;
  return allFiles()
    .map((abs) => ({ abs, mtime: fs.statSync(abs).mtimeMs }))
    .filter((f) => f.mtime >= cutoff)
    .sort((a, b) => b.mtime - a.mtime)
    .map((f) => ({
      path: relOf(f.abs),
      modified: new Date(f.mtime).toISOString(),
    }));
}

// Substring or regex search across text files. Returns matching lines.
function searchVault(query, isRegex = false, maxResults = 60) {
  const results = [];
  let matcher;
  if (isRegex) {
    matcher = new RegExp(query, 'i');
  }
  for (const abs of allFiles()) {
    if (!TEXT_EXT.has(path.extname(abs).toLowerCase())) continue;
    let text;
    try {
      text = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hit = isRegex
        ? matcher.test(line)
        : line.toLowerCase().includes(query.toLowerCase());
      if (hit) {
        results.push({ path: relOf(abs), line: i + 1, text: line.trim() });
        if (results.length >= maxResults) return results;
      }
    }
  }
  return results;
}

module.exports = {
  resolveInVault,
  listDirectory,
  readFile,
  writeFile,
  appendFile,
  recentFiles,
  searchVault,
};
