# Personal Jarvis — Obsidian + Claude

A system that runs in the background of your life, accumulates intelligence
about how you work, and gets measurably better at helping you every week — with
no extra effort from you.

This is **not** a voice assistant. It is an Obsidian vault wired to Claude that
reads your notes automatically, generates outputs on a schedule, surfaces
connections you didn't make consciously, and applies what it learned last week
to what it generates this week.

> Built from the "personal Jarvis" guide. This repo turns the guide into a
> ready-to-run system: the full vault scaffold, the `CLAUDE.md`, all seven
> skills, the configs, and a working scheduler/agent runner.

## What's in here

```
jarvis/
├── README.md                     <- you are here
├── config/
│   ├── claude_desktop_config.example.json   # Filesystem MCP config for Claude Desktop
│   └── schedules.json                       # cron schedule for all 7 skills
├── vault/                        <- the JARVIS-VAULT scaffold (copy into Obsidian)
│   ├── 00-INBOX/
│   ├── 01-KNOWLEDGE/  (permanent / decisions / insights / patterns)
│   ├── 02-PROJECTS/
│   ├── 03-DAILY/      (_TEMPLATE.md)
│   ├── 04-JARVIS-OUTPUTS/  (briefings / connections / patterns / syntheses / reviews)
│   ├── 05-RESOURCES/
│   ├── 06-ARCHIVE/
│   └── 07-SYSTEM/
│       ├── CLAUDE.md             <- the most important file: personalize this
│       ├── skills/               <- the 7 skill definitions
│       └── memory/               <- SQLite memory DB lives here (gitignored)
└── runner/                       <- working Node scheduler + agent (see runner/README.md)
```

## The three things that make it compound

1. **Accumulated memory.** Every skill run writes to a persistent memory DB. The
   week-12 morning brief draws on twelve weeks of context the week-1 brief never had.
2. **Skill + `CLAUDE.md` refinement.** The weekly synthesis and belief tracker
   recommend (and can apply) `CLAUDE.md` updates from accumulated evidence; every
   update calibrates every future run.
3. **Pattern recognition across time.** The monthly pattern detector reads across
   30 days and finds structural themes invisible at the scale of a single week.

## The seven skills

| # | Skill | When | What it does |
| - | ----- | ---- | ------------ |
| 1 | `morning-brief` | Daily 6:00 AM | The one thing that matters today, grounded in the vault |
| 2 | `capture-processor` | Daily 8:00 PM | Files everything you captured today into the right place |
| 3 | `connection-finder` | Nightly 11:00 PM | Surprising links between recent notes and old ones |
| 4 | `weekly-synthesis` | Sunday 7:00 PM | What only the full week reveals |
| 5 | `belief-tracker` | Monday 8:00 AM | Evidence for/against your stated beliefs |
| 6 | `pattern-detector` | 1st of month 8:00 AM | Structural patterns across 30 days |
| 7 | `decision-intelligence` | Monday 9:00 AM (+ on new decision files) | Structures and reviews decisions |

## Two ways to run it

### A. Interactive — Claude Desktop + Filesystem MCP
For talking to your vault on demand ("Morning brief", "Find connections").

1. Install [Claude Desktop](https://claude.ai/download) and [Node.js](https://nodejs.org).
2. Copy `vault/` into Obsidian as your `JARVIS-VAULT` (or point the MCP at it in place).
3. Edit your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`
   on macOS) using `config/claude_desktop_config.example.json` — set the path to your vault.
4. Restart Claude Desktop and test: *"List all folders in my vault and describe what you see."*

### B. Automated — the bundled runner (recommended for the schedule)
For the unattended 6 AM brief / 8 PM filing / etc. See **`runner/README.md`**.

```bash
cd jarvis/runner
npm install
cp .env.example .env        # set ANTHROPIC_API_KEY, VAULT_PATH, timezone, Telegram
node src/cli.js morning-brief   # test one skill
npm start                   # start the full schedule
```

The runner is a drop-in alternative to the guide's Hermes Agent — it shares the
same `.env` keys, the same `config/schedules.json`, and keeps the memory DB
inside your vault at `07-SYSTEM/memory/jarvis.db`.

## The build schedule (one weekend)

- **Sat morning (3h):** Install tools. Set up the vault. Connect Claude Desktop via
  MCP. Test. **Write `CLAUDE.md`** — spend two real hours on it.
- **Sat afternoon (2h):** Set up the runner `.env`. Run `morning-brief` manually.
  Refine `CLAUDE.md` based on what the output reveals is missing.
- **Sat evening (2h):** Run `capture-processor` and `connection-finder` manually; verify filing.
- **Sun (3h):** All seven skills are in place — start the scheduler (`npm start`).
  Let Sunday's `weekly-synthesis` run and verify it.
- **Week 1:** Just run it. Don't refine yet. Review the week's outputs at the end and
  update `CLAUDE.md` + any skills with systematic gaps.
- **Month 1:** The pattern detector runs for the first time with 30 days of data.

## Personalize `CLAUDE.md` first

Every skill reads `vault/07-SYSTEM/CLAUDE.md` before running and calibrates its
output to it. Replace every `[BRACKETED]` placeholder with the truth about how
you actually work, your focus areas, active projects, and current beliefs. Then
update it every Monday. The quality of everything Jarvis produces over the next
year is set by how well you write this file today.

## Permissions

By default Jarvis may read anything and write within the vault (so the capture
processor can file notes and the trackers can apply `CLAUDE.md` updates). To keep
a tighter leash, set `WRITE_SCOPE=outputs-only` in `runner/.env` — then it can
only write to `04-JARVIS-OUTPUTS/` and everything else requires your hand.
