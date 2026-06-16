'use strict';

const { validate } = require('./config');
const { availableSkills, runSkill } = require('./skills');
const { log, error } = require('./logger');

async function main() {
  const arg = process.argv[2];

  if (!arg || arg === 'list') {
    const skills = availableSkills();
    console.log('Available skills:');
    for (const s of skills) console.log('  - ' + s);
    console.log('\nUsage: node src/cli.js <skill-name>   (e.g. node src/cli.js morning-brief)');
    return;
  }

  const problems = validate();
  if (problems.length) {
    error('Configuration problems:');
    for (const p of problems) error('  - ' + p);
    process.exit(1);
  }

  const skills = availableSkills();
  if (!skills.includes(arg)) {
    error(`Unknown skill "${arg}". Available: ${skills.join(', ')}`);
    process.exit(1);
  }

  try {
    const result = await runSkill(arg);
    log('--- result summary ---');
    console.log(result);
    process.exit(0);
  } catch (err) {
    error(`Skill "${arg}" failed: ${err.message}`);
    process.exit(1);
  }
}

main();
