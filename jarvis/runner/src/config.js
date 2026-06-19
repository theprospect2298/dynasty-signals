'use strict';

const path = require('path');
const fs = require('fs');
require('dotenv').config();

function bool(v, def) {
  if (v === undefined || v === '') return def;
  return /^(1|true|yes|on)$/i.test(String(v).trim());
}

function int(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

// Vault defaults to the vault bundled next to this runner (../../vault).
const defaultVault = path.resolve(__dirname, '..', '..', 'vault');
const vaultPath = path.resolve(process.env.VAULT_PATH || defaultVault);

const config = {
  modelProvider: process.env.MODEL_PROVIDER || 'anthropic',
  // Default to a fast model so long agentic runs (brief, workers) finish well
  // under the API's per-request ceiling. Override with MODEL_NAME if desired.
  modelName: process.env.MODEL_NAME || 'claude-sonnet-4-6',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  maxTokens: int(process.env.MAX_TOKENS, 4096),
  maxToolIterations: int(process.env.MAX_TOOL_ITERATIONS, 60),

  vaultPath,
  skillsPath: path.join(vaultPath, '07-SYSTEM', 'skills'),
  claudeMdPath: path.join(vaultPath, '07-SYSTEM', 'CLAUDE.md'),
  memoryPath:
    process.env.MEMORY_PATH ||
    path.join(vaultPath, '07-SYSTEM', 'memory', 'jarvis.db'),
  outputPath:
    process.env.OUTPUT_PATH || path.join(vaultPath, '04-JARVIS-OUTPUTS'),
  writeScope: (process.env.WRITE_SCOPE || 'vault').toLowerCase(),

  enableScheduler: bool(process.env.ENABLE_SCHEDULER, true),
  enableBot: bool(process.env.ENABLE_TELEGRAM_BOT, true),
  enableMissionControl: bool(process.env.ENABLE_MISSION_CONTROL, false),
  timezone: process.env.SCHEDULER_TIMEZONE || 'UTC',
  schedulesPath: path.resolve(__dirname, '..', '..', 'config', 'schedules.json'),

  enableWebSearch: bool(process.env.ENABLE_WEB_SEARCH, true),
  webSearchMaxUses: int(process.env.WEB_SEARCH_MAX_USES, 2),

  retryEnabled: bool(process.env.SKILL_RETRY_ENABLED, true),
  retryMax: int(process.env.SKILL_RETRY_MAX, 3),
  retryDelaySec: int(process.env.SKILL_RETRY_DELAY, 300),

  notificationGateway: (process.env.NOTIFICATION_GATEWAY || 'none').toLowerCase(),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  // ---- Mission Control (parallel worker orchestrator) ----
  mc: {
    dbPath:
      process.env.MC_DB_PATH ||
      path.join(vaultPath, '07-SYSTEM', 'memory', 'mission-control.db'),
    maxConcurrent: int(process.env.MC_MAX_CONCURRENT, 3),
    pollSeconds: int(process.env.MC_POLL_SECONDS, 5),
    dailyBudgetUsd: parseFloat(process.env.MC_DAILY_BUDGET_USD || '5'),
    // Estimated price per million tokens (override per your plan/model).
    priceInputPerMTok: parseFloat(process.env.MC_PRICE_INPUT_PER_MTOK || '15'),
    priceOutputPerMTok: parseFloat(process.env.MC_PRICE_OUTPUT_PER_MTOK || '75'),
    statusFile:
      process.env.MC_STATUS_FILE ||
      path.join(vaultPath, '04-JARVIS-OUTPUTS', 'mission-control', 'status.md'),
    // Dry run: workers return a stub instead of calling the API (no cost).
    dryRun: bool(process.env.MC_DRY_RUN, false),
    // Auto-chaining guardrails: how deep a pipeline may go, and how many
    // follow-up tasks one worker may spawn.
    maxDepth: int(process.env.MC_MAX_DEPTH, 4),
    maxChildrenPerTask: int(process.env.MC_MAX_CHILDREN, 25),
  },
};

function validate() {
  const problems = [];
  if (!config.apiKey) problems.push('ANTHROPIC_API_KEY is not set.');
  if (!fs.existsSync(config.vaultPath)) {
    problems.push(`Vault path does not exist: ${config.vaultPath}`);
  }
  if (!fs.existsSync(config.claudeMdPath)) {
    problems.push(`CLAUDE.md not found at: ${config.claudeMdPath}`);
  }
  if (!fs.existsSync(config.skillsPath)) {
    problems.push(`Skills folder not found at: ${config.skillsPath}`);
  }
  return problems;
}

module.exports = { config, validate };
