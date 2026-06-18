'use strict';

const { config, validate } = require('./config');
const memory = require('./memory');
const scheduler = require('./scheduler');
const { log, error } = require('./logger');

function main() {
  const problems = validate();
  if (problems.length) {
    error('Configuration problems:');
    for (const p of problems) error('  - ' + p);
    error('Fix these (see runner/.env.example) and restart.');
    process.exit(1);
  }

  memory.init();
  log(`Jarvis runner starting.`);
  log(`  Vault:    ${config.vaultPath}`);
  log(`  Model:    ${config.modelName}`);
  log(`  Memory:   ${config.memoryPath}`);
  log(`  Timezone: ${config.timezone}`);
  log(`  Write scope: ${config.writeScope}`);
  log(`  Web search: ${config.enableWebSearch ? 'on' : 'off'}`);

  if (config.enableScheduler) {
    const tasks = scheduler.start();
    log(`Scheduler running with ${tasks.length} task(s). Ctrl-C to stop.`);
  } else {
    log('ENABLE_SCHEDULER is false. Use "node src/cli.js <skill>" to run skills manually.');
  }

  // Two-way Telegram control bot (phone remote).
  if (config.enableBot && config.telegramBotToken && config.telegramChatId) {
    require('./bot')
      .start()
      .catch((e) => error('Telegram bot crashed: ' + e.message));
  }

  // Optionally run Mission Control in the same process (useful on a server).
  if (config.enableMissionControl) {
    log('ENABLE_MISSION_CONTROL is true — starting the worker orchestrator.');
    require('./mc/orchestrator')
      .start()
      .catch((e) => error('Mission Control crashed: ' + e.message));
  }

  // Keep the process alive.
  process.stdin.resume();
  process.on('SIGINT', () => {
    log('Shutting down.');
    process.exit(0);
  });
}

main();
