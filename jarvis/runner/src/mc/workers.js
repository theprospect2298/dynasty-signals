'use strict';

const fs = require('fs');
const { config } = require('../config');
const { runAgentDetailed } = require('../anthropic');

// ---- Shared agent framing -------------------------------------------------

function readClaudeMd() {
  try {
    return fs.readFileSync(config.claudeMdPath, 'utf8');
  } catch {
    return '(CLAUDE.md not found)';
  }
}

function dateContext() {
  const tz = config.timezone;
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return { date, tz };
}

function baseSystem(roleLines, claudeMd) {
  return [
    'You are a specialized worker agent inside Carlos\'s "Mission Control" — a',
    'system that runs several worker agents in parallel over his Obsidian vault.',
    'You handle ONE task, end to end, using your tools to do real work (read,',
    'search the web, write files, store memory). Never fabricate sources, emails,',
    'or results — if you cannot verify something, say so and leave it blank.',
    '',
    ...roleLines,
    '',
    'General rules:',
    '- Ground everything in real, verifiable information. Cite URLs.',
    '- Honor the voice, standards, focus areas, and permissions in CLAUDE.md below.',
    '- Save your output to the vault path your role specifies, then store a short',
    '  memory entry, then reply with a one-paragraph summary (not the full output).',
    '',
    '=== BEGIN CLAUDE.md (Carlos\'s configuration) ===',
    claudeMd,
    '=== END CLAUDE.md ===',
  ].join('\n');
}

// ---- Worker registry ------------------------------------------------------

const registry = {
  'client-finder': {
    description:
      'Finds qualified prospect brands (with public emails + a real intent trigger) for a niche.',
    system: (cmd) =>
      baseSystem(
        [
          'ROLE: Client-Finder.',
          'Given a niche (and optional location), find qualified prospect brands that',
          'fit Carlos\'s offer (motion + web for physical-product / local brands).',
          'For each brand collect: name, website, a PUBLIC, citable email, and a REAL',
          'intent trigger (new location, recent rebrand, just-opened, weak/old site,',
          'active hiring, new product launch). Only include brands where you found a',
          'genuine public email — never invent or guess emails.',
          'Output a markdown table with columns:',
          '| Brand | Website | Public Email | Intent Trigger | Source URL |',
          'Save to: 05-RESOURCES/leads/[DATE]-[niche].md (create folders as needed).',
          'Store memory tagged: client-finder, [niche], [DATE].',
        ],
        cmd
      ),
    prompt: (p, dc) =>
      [
        `Task: find ${p.count || 15} qualified ${p.niche || 'local business'} brands` +
          (p.location ? ` in/near ${p.location}` : '') + '.',
        `Today is ${dc.date} (${dc.tz}). Use ${dc.date} for [DATE].`,
        'Prioritize brands with the strongest, most specific intent trigger.',
        'If you cannot find a public email for a brand, drop it rather than guess.',
      ].join('\n'),
  },

  'brand-research': {
    description:
      'Deep-researches one brand: trigger, decision-maker, contact, and the best angle.',
    system: (cmd) =>
      baseSystem(
        [
          'ROLE: Brand-Research.',
          'Given one brand, produce a tight research note Carlos can act on:',
          '- What they do / product, and why they fit the offer',
          '- The strongest current intent trigger (with source URL + date if possible)',
          '- Best public contact (email / form / decision-maker name if public)',
          '- Recommended angle: lead with web, motion, or a bundle — and the hook',
          '- Any red flags (in-house team, tiny budget signals, recently rebranded)',
          'Save to: 05-RESOURCES/leads/research/[brand].md',
          'Store memory tagged: brand-research, [brand], [DATE].',
        ],
        cmd
      ),
    prompt: (p, dc) =>
      [
        `Research this brand: ${p.brand}${p.website ? ` (${p.website})` : ''}.`,
        `Today is ${dc.date}. Be concrete and cite sources. No fabrication.`,
      ].join('\n'),
  },

  'outreach-drafter': {
    description:
      'Writes an on-brand cold outreach draft for one researched brand (for review, not auto-send).',
    system: (cmd) =>
      baseSystem(
        [
          'ROLE: Outreach-Drafter.',
          'Given a brand (and its research note if present in the vault), draft a cold',
          'outreach email FOR CARLOS TO REVIEW — never send anything.',
          'Lead with the brand\'s specific intent trigger, not a generic pitch. Keep it',
          'short (under ~120 words), match the Content and Output Standards voice in',
          'CLAUDE.md (premium, design-led, no hype/clichés), and end with one low-',
          'friction ask. Provide a subject line + body + a one-line "why this angle".',
          'Save to: 04-JARVIS-OUTPUTS/outreach/[DATE]-[brand].md',
          'Store memory tagged: outreach-drafter, [brand], [DATE].',
        ],
        cmd
      ),
    prompt: (p, dc) =>
      [
        `Draft cold outreach for: ${p.brand}.`,
        p.angle ? `Suggested angle: ${p.angle}.` : '',
        `First check 05-RESOURCES/leads/research/ for an existing research note on this brand and use it.`,
        `Today is ${dc.date}. This is a DRAFT for review — do not send.`,
      ]
        .filter(Boolean)
        .join('\n'),
  },
};

function list() {
  return Object.entries(registry).map(([name, w]) => ({
    name,
    description: w.description,
  }));
}

function estimateCost(usage) {
  const inUsd = (usage.input_tokens / 1e6) * config.mc.priceInputPerMTok;
  const outUsd = (usage.output_tokens / 1e6) * config.mc.priceOutputPerMTok;
  return +(inUsd + outUsd).toFixed(4);
}

// Execute a task with its worker. Returns { result, cost }.
async function run(task) {
  const worker = registry[task.worker];
  if (!worker) throw new Error(`Unknown worker: ${task.worker}`);
  const dc = dateContext();

  if (config.mc.dryRun) {
    // Simulate work without spending: brief delay + canned result.
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    return {
      result: `[DRY RUN] ${task.worker} would process ${JSON.stringify(task.payload)}`,
      cost: 0,
    };
  }

  const claudeMd = readClaudeMd();
  const { text, usage } = await runAgentDetailed({
    system: worker.system(claudeMd),
    userPrompt: worker.prompt(task.payload, dc),
  });
  return { result: text, cost: estimateCost(usage) };
}

module.exports = { list, run, registry };
