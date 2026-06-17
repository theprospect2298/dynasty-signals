'use strict';

const fs = require('fs');
const { config } = require('../config');
const { runAgentDetailed } = require('../anthropic');
const queue = require('./queue');

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
    chainTo: ['brand-research'],
    system: (cmd) =>
      baseSystem(
        [
          'ROLE: Client-Finder (pipeline stage 1 of 3).',
          'Given a niche (and optional location), find qualified prospect brands that',
          'fit Carlos\'s offer (motion + web for physical-product / local brands).',
          'For each brand collect: name, website, a PUBLIC, citable email, and a REAL',
          'intent trigger (new location, recent rebrand, just-opened, weak/old site,',
          'active hiring, new product launch). Only include brands where you found a',
          'genuine public email — never invent or guess emails.',
          'Output a markdown table with columns:',
          '| Brand | Website | Public Email | Intent Trigger | Source URL |',
          'Save to: 05-RESOURCES/leads/[DATE]-[niche].md (create folders as needed).',
          'PIPELINE: for EACH qualified brand you save, call the enqueue_task tool',
          'with worker="brand-research" and payload {"brand": <name>, "website": <url>}',
          'so it gets deep-researched automatically. Do this once per lead, after you',
          'have verified the lead is worth pursuing.',
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
    chainTo: ['outreach-drafter'],
    system: (cmd) =>
      baseSystem(
        [
          'ROLE: Brand-Research (pipeline stage 2 of 3).',
          'Given one brand, produce a tight research note Carlos can act on:',
          '- What they do / product, and why they fit the offer',
          '- The strongest current intent trigger (with source URL + date if possible)',
          '- Best public contact (email / form / decision-maker name if public)',
          '- Recommended angle: lead with web, motion, or a bundle — and the hook',
          '- Any red flags (in-house team, tiny budget signals, recently rebranded)',
          'Save to: 05-RESOURCES/leads/research/[brand].md',
          'PIPELINE: if (and only if) the brand is a genuine fit with no dealbreaker',
          'red flags, call the enqueue_task tool with worker="outreach-drafter" and',
          'payload {"brand": <name>, "angle": <your recommended angle>} to queue a',
          'draft. If it is NOT a fit, do not enqueue — just note why in the research.',
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
    chainTo: [],
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

// Build the scoped enqueue_task tool for a task, or null if this worker is a
// pipeline leaf. The handler enforces: forward-only chain, depth cap, fan-out cap.
function buildChainer(task, worker) {
  const allowed = worker.chainTo || [];
  if (allowed.length === 0) return null;
  const depth = task.depth || 0;
  let children = 0;

  const toolDef = {
    name: 'enqueue_task',
    description:
      `Queue a follow-up task for the next pipeline stage. Allowed worker(s): ${allowed.join(', ')}. ` +
      'Call once per item you want handed off downstream.',
    input_schema: {
      type: 'object',
      properties: {
        worker: { type: 'string', description: `Downstream worker, one of: ${allowed.join(', ')}.` },
        payload: { type: 'object', description: 'Task payload for that worker.' },
      },
      required: ['worker'],
    },
  };

  const handler = async (input) => {
    const w = input.worker;
    if (!allowed.includes(w)) {
      return JSON.stringify({ error: `Not allowed to enqueue "${w}". Allowed: ${allowed.join(', ')}.` });
    }
    if (depth + 1 > config.mc.maxDepth) {
      return JSON.stringify({ error: 'Max pipeline depth reached; not enqueued.' });
    }
    if (children >= config.mc.maxChildrenPerTask) {
      return JSON.stringify({ error: 'Per-task child limit reached; not enqueued.' });
    }
    children += 1;
    const id = queue.enqueue(w, input.payload || {}, task.priority || 5, {
      parent_id: task.id,
      root_id: task.root_id || task.id,
      depth: depth + 1,
    });
    return JSON.stringify({ queued: id, worker: w });
  };

  return { toolDef, handler };
}

// Execute a task with its worker. Returns { result, cost }.
async function run(task) {
  const worker = registry[task.worker];
  if (!worker) throw new Error(`Unknown worker: ${task.worker}`);
  const dc = dateContext();
  const chainer = buildChainer(task, worker);

  if (config.mc.dryRun) {
    // Simulate work (and the downstream handoff) without spending.
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 900));
    let spawned = 0;
    if (chainer) {
      const n = task.worker === 'client-finder' ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const res = await chainer.handler({
          worker: worker.chainTo[0],
          payload: { brand: `DemoBrand-${task.id}-${i}` },
        });
        if (!JSON.parse(res).error) spawned += 1;
      }
    }
    return {
      result:
        `[DRY RUN] ${task.worker} processed ${JSON.stringify(task.payload)}` +
        (spawned ? ` → queued ${spawned} ${worker.chainTo[0]} task(s)` : ''),
      cost: 0,
    };
  }

  const claudeMd = readClaudeMd();
  const opts = {
    system: worker.system(claudeMd),
    userPrompt: worker.prompt(task.payload, dc),
  };
  if (chainer) {
    opts.extraTools = [chainer.toolDef];
    opts.dispatchExtra = { enqueue_task: chainer.handler };
  }
  const { text, usage } = await runAgentDetailed(opts);
  return { result: text, cost: estimateCost(usage) };
}

module.exports = { list, run, registry };
