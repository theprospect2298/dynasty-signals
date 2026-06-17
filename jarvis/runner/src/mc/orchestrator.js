'use strict';

const { config } = require('../config');
const queue = require('./queue');
const workers = require('./workers');
const dashboard = require('./dashboard');
const { notify } = require('../notify');
const { log, error } = require('../logger');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let budgetAlerted = false;

async function runTask(task) {
  try {
    const { result, cost } = await workers.run(task);
    queue.complete(task.id, result, cost);
    log(`✓ #${task.id} ${task.worker} done ($${cost.toFixed(3)})`);
    await notify(`✓ ${task.worker} #${task.id} done — ${oneLine(result)}`);
  } catch (err) {
    queue.fail(task.id, err.message);
    error(`✗ #${task.id} ${task.worker} failed: ${err.message}`);
    await notify(`✗ ${task.worker} #${task.id} failed: ${err.message}`);
  }
}

function oneLine(s) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > 120 ? t.slice(0, 117) + '...' : t;
}

async function start() {
  queue.init();
  const inFlight = new Set();

  log('Mission Control starting.');
  log(`  Max concurrent: ${config.mc.maxConcurrent}`);
  log(`  Daily budget:   $${config.mc.dailyBudgetUsd.toFixed(2)}`);
  log(`  Dry run:        ${config.mc.dryRun}`);
  log(`  DB:             ${config.mc.dbPath}`);

  let stopping = false;
  process.on('SIGINT', () => {
    stopping = true;
    log('\nStopping after in-flight tasks finish… (Ctrl-C again to force quit)');
    process.once('SIGINT', () => process.exit(0));
  });

  while (!stopping) {
    const overBudget = queue.todayCost() >= config.mc.dailyBudgetUsd;
    if (overBudget && !budgetAlerted) {
      budgetAlerted = true;
      log('Daily budget reached — pausing dispatch until tomorrow.');
      await notify('⚠️ Mission Control hit its daily budget — dispatch paused.');
    }
    if (!overBudget) budgetAlerted = false;

    // Fill the worker pool with queued tasks.
    while (!overBudget && inFlight.size < config.mc.maxConcurrent) {
      const task = queue.claimNext();
      if (!task) break;
      log(`▶ dispatch #${task.id} ${task.worker}`);
      const p = runTask(task).finally(() => inFlight.delete(p));
      inFlight.add(p);
    }

    dashboard.render();
    await sleep(config.mc.pollSeconds * 1000);
  }

  // Drain in-flight work before exit.
  if (inFlight.size) {
    log(`Waiting on ${inFlight.size} in-flight task(s)…`);
    await Promise.allSettled([...inFlight]);
  }
  log('Mission Control stopped.');
  process.exit(0);
}

module.exports = { start };
