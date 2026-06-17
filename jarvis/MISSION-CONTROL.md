# Mission Control — parallel worker agents

The scheduled 7-skill Jarvis reacts to *time*. **Mission Control** reacts to
*work*: it's an always-on orchestrator that runs several specialized worker
agents **in parallel** whenever there are tasks in its queue — and sits idle
(spending nothing) when there aren't.

This is the "mission control + subagents" layer. Your 7 Jarvis skills still run
on their own schedule; Mission Control is a separate, on-demand crew.

```
        ┌──────────────── MISSION CONTROL (always on) ───────────────┐
        │  task queue + live dashboard + budget cap + notifications    │
        └───┬────────────────┬────────────────┬───────────────────────┘
            ▼                ▼                ▼      (up to N in parallel)
     client-finder     brand-research   outreach-drafter
            └──────── each is an agent that works in your vault ────────┘
```

## The workers

| Worker | What it does | Saves to |
| --- | --- | --- |
| **client-finder** | Finds qualified brands for a niche — name, website, **public** email, and a real intent trigger | `05-RESOURCES/leads/[date]-[niche].md` |
| **brand-research** | Deep-researches one brand: trigger, contact, decision-maker, best angle, red flags | `05-RESOURCES/leads/research/[brand].md` |
| **outreach-drafter** | Drafts an on-brand cold email **for your review** (never sends) | `04-JARVIS-OUTPUTS/outreach/[date]-[brand].md` |

Every worker reads your `CLAUDE.md`, so the leads, research, and drafts come out
calibrated to your offer, voice, and standards. Workers never fabricate emails or
sources — if they can't verify, they leave it blank.

## Guardrails (important)

Always-on parallel agents can spend real money, so Mission Control is capped:

- **`MC_MAX_CONCURRENT`** — how many workers run at once (default 3).
- **`MC_DAILY_BUDGET_USD`** — when estimated spend today crosses this, dispatch
  pauses until tomorrow and you get a Telegram alert (default $5).
- **Idle = free** — when the queue is empty, nothing runs and nothing is spent.
- **`MC_DRY_RUN=true`** — run the whole pipeline with stubbed workers (no API
  calls, no cost) to see it work first.

The budget number is an *estimate* from token usage × the per-token prices in
`.env` (`MC_PRICE_*`). Tune those to your plan.

## Run it

From `jarvis/runner`:

```bash
# 1. See the workers
node src/cli.js mc workers

# 2. Queue some work (a starter batch of lead-finding tasks)
node src/cli.js mc demo
#    …or queue your own:
node src/cli.js mc enqueue client-finder '{"niche":"med spas","count":15,"location":"Miami"}'
node src/cli.js mc enqueue brand-research '{"brand":"Acme Coffee","website":"acme.coffee"}'
node src/cli.js mc enqueue outreach-drafter '{"brand":"Acme Coffee"}'

# 3. Start the orchestrator (live dashboard; Ctrl-C to stop)
node src/cli.js mc start

# one-shot status without starting:
node src/cli.js mc status
```

### Test for free first
```bash
MC_DRY_RUN=true node src/cli.js mc demo
MC_DRY_RUN=true node src/cli.js mc start
```
You'll see tasks dispatch and complete in parallel with `$0.000` cost. When it
looks right, drop `MC_DRY_RUN` (or set it `false`) to do real work.

## Auto-chaining (the self-driving pipeline)

You don't queue each stage by hand. The workers hand off to each other:

```
  client-finder ──(per lead)──▶ brand-research ──(if a fit)──▶ outreach-drafter
     depth 0                        depth 1                        depth 2
```

- **client-finder**, for each qualified lead it saves, queues a **brand-research**
  task for that brand.
- **brand-research**, when the brand is a genuine fit (no dealbreakers), queues an
  **outreach-drafter** task with its recommended angle.
- **outreach-drafter** is the end of the line — it drafts and stops.

So you queue **one** thing and the rest cascades:

```bash
node src/cli.js mc enqueue client-finder '{"niche":"med spas","count":10,"location":"Miami"}'
node src/cli.js mc start
```

One med-spa task becomes ~10 research tasks becomes ~N drafts — all in parallel,
all written to your vault, with each draft waiting for your review.

### Why it can't run away
Chaining is **forward-only and capped**:

- Each worker may only queue its *one* designated next stage (enforced in code,
  not by the prompt) — no loops, no sideways spawning.
- **`MC_MAX_DEPTH`** (default 4) hard-stops the cascade depth.
- **`MC_MAX_CHILDREN`** (default 25) caps how many follow-ups one task can spawn.
- The **daily budget cap** still governs the whole thing — when spend crosses
  `MC_DAILY_BUDGET_USD`, dispatch pauses regardless of how much is queued.

Every task records its `parent_id`, `root_id`, and `depth`, so you can always
trace a draft back to the lead and the original niche that produced it.

Test the whole cascade for free first:
```bash
MC_DRY_RUN=true node src/cli.js mc enqueue client-finder '{"niche":"med spas"}'
MC_DRY_RUN=true node src/cli.js mc start
```
You'll see depth `d0 → d1 → d2` tasks fan out and complete at `$0.000`.

## How it fits with the scheduler

- `node src/index.js` (a.k.a. `npm start`) = the **scheduled** 7 skills.
- `node src/cli.js mc start` = the **always-on parallel** workers.

They're independent processes and share the same vault + memory. Run one or both.
With `pm2` you can keep both alive (see `DEPLOY.md`):

```bash
pm2 start src/index.js --name jarvis
pm2 start "src/cli.js mc start" --name mission-control --interpreter node
pm2 save
```

## Live status in your vault

While running, Mission Control writes a snapshot to
`04-JARVIS-OUTPUTS/mission-control/status.md`, so you can watch it from inside
Obsidian, and it pings Telegram as each task finishes.

## Adding your own worker

Workers live in `runner/src/mc/workers.js` in the `registry`. Each is just a
name + a `system(claudeMd)` prompt (its role) + a `prompt(payload, dc)` (the
task). Add an entry and it's immediately queueable via `mc enqueue`.
