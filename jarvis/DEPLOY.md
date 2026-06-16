# Deploying Jarvis (always-on)

The runner only does its job if it's alive at 6 AM, 8 PM, etc. This guide gets it
running 24/7 on a **Mac** (the natural choice, since that's where Obsidian lives)
using `pm2` so it survives logouts and reboots.

> Linux/VPS works the same — skip the macOS-sleep section.

---

## 0. Prerequisites (once)

- **Node.js 18+** — check with `node --version`. Install from <https://nodejs.org> if missing.
- **Your Obsidian vault** — either use the bundled `jarvis/vault`, or copy it into
  your real Obsidian vault location and point `VAULT_PATH` at that.
- **An Anthropic API key** — <https://console.anthropic.com> → API Keys.

---

## 1. Get the code onto the Mac

```bash
git clone <your-repo-url> dynasty-signals
cd dynasty-signals/jarvis/runner
npm install
```

---

## 2. Configure `.env`

```bash
cp .env.example .env
```

Open `.env` and set these (the rest can stay default):

```ini
ANTHROPIC_API_KEY=sk-ant-...            # your key
VAULT_PATH=/Users/carlos/Obsidian/JARVIS-VAULT   # absolute path to YOUR vault
SCHEDULER_TIMEZONE=America/New_York     # EST/EDT for Pembroke Pines
NOTIFICATION_GATEWAY=none               # or "telegram" once you set up a bot
```

> Keep `.env` private — it holds your key and is already gitignored. Never commit it.

---

## 3. Test before automating

Run one skill by hand and confirm a file lands in `04-JARVIS-OUTPUTS/`:

```bash
node src/cli.js morning-brief
node src/cli.js list          # see all 7 skill names
```

If that writes a brief, you're ready to automate.

---

## 4. Run it 24/7 with pm2

```bash
npm install -g pm2

# start the scheduler (run from jarvis/runner)
pm2 start src/index.js --name jarvis

# make it come back after a reboot
pm2 save
pm2 startup          # prints one command — copy/paste & run it (needs your password)
```

Useful pm2 commands:

```bash
pm2 status                 # is jarvis running?
pm2 logs jarvis            # live logs (watch the 6AM brief fire)
pm2 logs jarvis --lines 200
pm2 restart jarvis         # after you change .env or pull new code
pm2 stop jarvis            # pause it
pm2 delete jarvis          # remove it from pm2
```

---

## 5. macOS gotcha: don't let the Mac sleep

A sleeping Mac runs nothing — the 6 AM brief won't fire if the lid's closed and
the machine is asleep. Pick one:

- **Simplest:** System Settings → **Battery / Lock Screen** → set "turn display
  off" but prevent sleep while plugged in (Battery → Options → *Prevent automatic
  sleeping on power adapter when display is off*).
- **Wake for the schedule:** schedule daily wake-ups so it's up before 6 AM:
  ```bash
  sudo pmset repeat wake MTWRFSU 05:55:00
  ```
- **Keep-awake while testing:** run the scheduler under `caffeinate`:
  ```bash
  pm2 delete jarvis
  caffeinate -s pm2 start src/index.js --name jarvis
  ```

> A clamshell (lid-closed) MacBook sleeps unless on power + external display, or
> using a tool like Amphetamine. If you want true always-on, a cheap VPS or a
> Raspberry Pi is more reliable than a laptop.

---

## 6. Updating

When you pull new code or change skills/`.env`:

```bash
git pull
cd jarvis/runner && npm install     # only if dependencies changed
pm2 restart jarvis
```

Editing files in the vault (notes, `CLAUDE.md`) needs **no restart** — every
skill run reads them fresh.

---

## 7. Verify it's actually working

- `pm2 logs jarvis` should show `Scheduler running with 7 task(s).`
- After 6 AM (your TZ), a new file appears in `vault/04-JARVIS-OUTPUTS/briefings/`.
- The memory DB grows at `vault/07-SYSTEM/memory/jarvis.db`.

If a scheduled run fails, the runner retries per `SKILL_RETRY_*` in `.env` and
logs the error — check `pm2 logs jarvis`.

---

## Schedule reference

| Skill | When (local TZ) |
| --- | --- |
| morning-brief | Daily 6:00 AM |
| capture-processor | Daily 8:00 PM |
| connection-finder | Nightly 11:00 PM |
| weekly-synthesis | Sunday 7:00 PM |
| belief-tracker | Monday 8:00 AM |
| decision-intelligence | Monday 9:00 AM |
| pattern-detector | 1st of month 8:00 AM |

Change any of these in `jarvis/config/schedules.json`, then `pm2 restart jarvis`.
