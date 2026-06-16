# Jarvis Runner

A small Node service that executes the seven Jarvis skills against your Obsidian
vault on a schedule. It is a self-contained alternative to the Hermes Agent
referenced in the guide — same `.env` knobs, same cron schedule, same memory
database location — so you can run the whole system with just an Anthropic API
key.

## What it does

For each scheduled (or manually triggered) skill it:

1. Loads your `07-SYSTEM/CLAUDE.md` as the system prompt.
2. Loads the skill definition from `07-SYSTEM/skills/<skill>.md`.
3. Runs an agentic loop where the model uses tools to **actually** read, search,
   and write files in the vault, pull persistent memory, search the web, and
   send a Telegram notification.
4. Stores a memory entry tagged with the skill name and date so future runs
   compound on past context.

### Tools available to the agent

| Tool | Purpose |
| --- | --- |
| `list_directory` / `read_file` | Read vault structure and notes |
| `search_vault` | Keyword / regex search across notes |
| `list_recent_files` | Find notes modified in the last N hours |
| `write_file` / `append_file` | Save outputs and file notes (guarded by `WRITE_SCOPE`) |
| `memory_search` / `memory_store` | Read and write the SQLite memory DB |
| `web_search` | Anthropic server-side web search for external intelligence |
| `send_notification` | Telegram push |

## Setup

```bash
cd jarvis/runner
npm install
cp .env.example .env
# edit .env: set ANTHROPIC_API_KEY, VAULT_PATH, timezone, Telegram (optional)
```

By default `VAULT_PATH` points at the bundled `../vault`. Point it at your real
Obsidian vault once you have one.

## Run

Start the scheduler (runs all seven skills at their cron times):

```bash
npm start
```

Run a single skill immediately (great for testing and for the Day-1 build):

```bash
npm run -- morning-brief
npm run -- capture-processor
npm run list           # list skill names
```

## Safety

- **Path scoping:** every file tool is sandboxed to the vault root; paths that
  escape it are rejected.
- **`WRITE_SCOPE`:** `vault` (default) lets the capture processor file notes and
  the belief tracker apply `CLAUDE.md` updates. Set `outputs-only` to restrict
  all writes to `04-JARVIS-OUTPUTS` and keep everything else read-only.
- **`MAX_TOOL_ITERATIONS`:** caps the agent loop so a run can't spin forever.
- **Retry:** `SKILL_RETRY_*` controls automatic backoff on failure.

## Notes

- Requires Node 18+ (uses the built-in `fetch`).
- The memory database lives **inside the vault** at
  `07-SYSTEM/memory/jarvis.db`, so it backs up with everything else — exactly as
  the guide specifies.
- Want to use the original Hermes Agent instead? The `.env` keys here are a
  superset of the guide's, and `../config/schedules.json` is shared, so you can
  swap runners without touching your vault.
