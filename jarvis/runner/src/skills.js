'use strict';

const fs = require('fs');
const path = require('path');
const { config } = require('./config');
const memory = require('./memory');
const { runAgent } = require('./anthropic');
const { log, warn, error } = require('./logger');

function availableSkills() {
  if (!fs.existsSync(config.skillsPath)) return [];
  return fs
    .readdirSync(config.skillsPath)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

function loadSkill(name) {
  const file = path.join(config.skillsPath, `${name}.md`);
  if (!fs.existsSync(file)) {
    throw new Error(`Skill not found: ${name} (${file})`);
  }
  return fs.readFileSync(file, 'utf8');
}

function dateContext() {
  const now = new Date();
  const tz = config.timezone;
  const fmt = (opts) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: tz, ...opts }).format(now);
  const date = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' });
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
  }).format(now);
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  return { date, weekday, time, tz };
}

function buildSystemPrompt(claudeMd) {
  return [
    'You are Jarvis, a personal intelligence system operating over the user\'s',
    'Obsidian vault. You execute one skill per run by following its instructions',
    'exactly. You have tools to read, search, and write files in the vault, to',
    'store and retrieve persistent memory, to search the web for external',
    'intelligence, and to send notifications.',
    '',
    'Operating rules:',
    '- Follow the skill\'s STEPS in order. Do the actual work with tools; never',
    '  fabricate file contents or pretend a tool ran.',
    '- Ground every claim in specific vault evidence. Cite file paths.',
    '- Respect the permissions and intelligence standards in the configuration',
    '  below. Strong signal only. Generic advice is failure.',
    '- Replace [DATE] in output filenames with the real date provided each run.',
    '- Always finish by saving the output file(s), storing the memory entry the',
    '  skill specifies, and sending the notification if the skill asks for one.',
    '- When done, reply with a one-paragraph summary of what you produced and',
    '  where you saved it. Do not paste the full output back into the reply.',
    '',
    '=== BEGIN CLAUDE.md (the user\'s configuration) ===',
    claudeMd,
    '=== END CLAUDE.md ===',
  ].join('\n');
}

function buildUserPrompt(name, skillBody, dc) {
  return [
    `Execute the "${name}" skill now.`,
    '',
    `Today is ${dc.weekday}, ${dc.date} (${dc.time} ${dc.tz}).`,
    `Use ${dc.date} wherever the skill writes [DATE].`,
    '',
    'Here is the skill definition. Follow it precisely:',
    '',
    skillBody,
  ].join('\n');
}

async function runOnce(name) {
  const claudeMd = fs.readFileSync(config.claudeMdPath, 'utf8');
  const skillBody = loadSkill(name);
  const dc = dateContext();

  log(`Running skill "${name}" for ${dc.date} ...`);
  const result = await runAgent({
    system: buildSystemPrompt(claudeMd),
    userPrompt: buildUserPrompt(name, skillBody, dc),
  });

  memory.store([name, dc.date, 'skill-run'], `[${name}] ${result}`);
  log(`Skill "${name}" complete.`);
  return result;
}

// Run with retry/backoff per the .env configuration.
async function runSkill(name) {
  const attempts = config.retryEnabled ? config.retryMax : 1;
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await runOnce(name);
    } catch (err) {
      lastErr = err;
      error(`Skill "${name}" attempt ${attempt}/${attempts} failed: ${err.message}`);
      if (attempt < attempts) {
        const delayMs = config.retryDelaySec * 1000;
        warn(`Retrying "${name}" in ${config.retryDelaySec}s ...`);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

module.exports = { availableSkills, loadSkill, runOnce, runSkill };
