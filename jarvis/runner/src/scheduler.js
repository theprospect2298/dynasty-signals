'use strict';

const fs = require('fs');
const cron = require('node-cron');
const { config } = require('./config');
const { runSkill } = require('./skills');
const { log, warn, error } = require('./logger');

function loadSchedules() {
  const raw = fs.readFileSync(config.schedulesPath, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.schedules || [];
}

function start() {
  const schedules = loadSchedules();
  const tasks = [];

  for (const s of schedules) {
    if (!cron.validate(s.cron)) {
      warn(`Invalid cron "${s.cron}" for skill "${s.skill}" — skipping.`);
      continue;
    }
    const task = cron.schedule(
      s.cron,
      async () => {
        log(`Triggered "${s.skill}" (${s.description || s.cron}).`);
        try {
          await runSkill(s.skill);
        } catch (err) {
          error(`Scheduled "${s.skill}" ultimately failed: ${err.message}`);
        }
      },
      { timezone: config.timezone }
    );
    tasks.push(task);
    log(`Scheduled "${s.skill}" at "${s.cron}" (${s.description || ''}) [${config.timezone}]`);
  }

  return tasks;
}

module.exports = { start, loadSchedules };
