# Run Jarvis in the cloud (no computer needed)

Goal: Jarvis runs **24/7 on a small cloud server** and you control it entirely
**from your phone via Telegram** — your Mac can be off.

What runs in the cloud (one container):
- the **scheduler** (6 AM brief, 8 PM filing, …)
- the **two-way Telegram bot** (you text it commands)
- **Mission Control** (the parallel lead pipeline)

Everything is saved on a **persistent disk**, so your notes, memory, and outputs
survive restarts and redeploys.

> Prerequisite: the Telegram bot must already work (you finished that — `/help`
> replies). You'll reuse the same `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.

---

## Option A — Railway (easiest from a phone) ⭐

Railway can deploy straight from your GitHub repo in a browser — phone or laptop.

1. Go to **railway.app** → sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → pick `theprospect2298/dynasty-signals`.
3. In the service **Settings**:
   - **Root Directory:** `jarvis`
   - **Builder:** Dockerfile (Railway auto-detects `jarvis/Dockerfile`).
4. Add a **Volume** (Settings → Volumes): mount path **`/data`** (1 GB is plenty).
   This is what makes your vault persistent.
5. Add **Variables** (Settings → Variables):
   | Key | Value |
   | --- | --- |
   | `ANTHROPIC_API_KEY` | your key |
   | `TELEGRAM_BOT_TOKEN` | your bot token |
   | `TELEGRAM_CHAT_ID` | `1117892475` |
   | `SCHEDULER_TIMEZONE` | `America/New_York` |
   | `MC_DAILY_BUDGET_USD` | `5` |
6. **Deploy.** When the logs show `Scheduler running…` and you get the Telegram
   message **“🤖 Jarvis control bot online,”** it's live.

Test from your phone: text your bot **`/help`**, then **`/brief`**.

Cost: Railway's usage-based plan; this tiny always-on worker is typically a few
dollars a month.

---

## Option B — Render (declarative, `render.yaml` included)

1. Go to **render.com** → **New → Blueprint** → connect the repo.
2. Render reads **`jarvis/render.yaml`** and proposes a **worker** service with a
   1 GB disk at `/data`.
3. Fill in the secret env vars it asks for (`ANTHROPIC_API_KEY`,
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`). The rest are preset.
4. **Apply / Create.** Watch logs for `Scheduler running…` + the Telegram online
   message.

Note: Render background workers need a paid plan (~$7/mo) — the free tier is
web-only and sleeps, which would stop your schedule.

---

## After it's live — run everything from your phone

Text your bot:

| You send | What happens |
| --- | --- |
| `/brief` | Runs today's morning brief, replies with it |
| `/capture <note>` | Saves a note to today's daily note |
| `/process` | Files today's captures now |
| `/find boutique gyms, Miami` | Kicks off the lead pipeline (finds → researches → drafts) |
| `/status` | Mission Control status |
| `/skill <name>` | Runs any of the 7 skills |
| `/help` | Lists commands |

The scheduled briefs/syntheses also keep arriving automatically, and Mission
Control runs your queued pipelines — all with the Mac off.

---

## Updating it later

Push changes to the repo (or merge to `main`) and the host **auto-redeploys**.
Your `/data` volume (vault + memory) is preserved across deploys.

## Editing CLAUDE.md in the cloud

Your config is seeded from the repo on first boot. To change it later, edit
`jarvis/vault/07-SYSTEM/CLAUDE.md` in the repo and redeploy — or ask and I can
add a `/claude` bot command to view/update it from your phone.

## Cost control

- `MC_DAILY_BUDGET_USD` caps Mission Control's daily spend (pauses + alerts you).
- The scheduled skills are ~9 short runs/week.
- Idle time costs only the tiny server fee, not API calls.
