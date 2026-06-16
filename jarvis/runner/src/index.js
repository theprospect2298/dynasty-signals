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
    log('ENABLE_SCHEDULER is false. Use "npm run -- <skill>" to run skills manually.');
  }

  // Keep the process alive.
  process.stdin.resume();
  process.on('SIGINT', () => {
    log('Shutting down.');
    process.exit(0);
  });
}

main();
