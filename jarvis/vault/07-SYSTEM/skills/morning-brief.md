# morning-brief

## Purpose
Generate a structured morning intelligence brief that surfaces what matters
today from all accumulated context.

## Trigger
Scheduled daily at 6:00 AM.
Manual: "Morning brief" or "What matters today"

## Pre-Execution Checks
Verify CLAUDE.md is readable.
Verify output path is writable.
Verify memory is accessible.

## Process

STEP 1: Context loading
Read CLAUDE.md fully.
Read memory tagged: morning-brief for last 7 entries.
Note what was covered recently to avoid repetition.

STEP 2: Vault reading
Read yesterday's daily note for open loops.
Read all active project files for current status.
Flag any project with no file modification in 7 days as potentially stalled.

STEP 3: External intelligence
Search for developments in each focus area from CLAUDE.md in the last 24 hours.
Apply signal filter: strong signal only.
Skip anything that appeared in last 5 briefs.

STEP 4: Synthesis
What is the single most important thing today?
Grounded in vault evidence. Specific. Actionable.

What open loops from yesterday matter most?
Only the ones with consequence if not resolved.

What does each active project need today?
One line. One action. No padding.

What external signal is genuinely relevant?
Maximum three items. Nothing weak.

STEP 5: Quality verification
Brief must be readable in under 5 minutes.
Every item must be grounded in specific vault evidence.
No generic advice. No padding.
Single most important thing must be actionable immediately.

STEP 6: Output

---
# Morning Brief — [DATE]

## THE ONE THING
[Single most important thing today. Specific. Grounded.]

## OPEN LOOPS
[Yesterday's unresolved items with consequence.]

## PROJECT STATUS
[One line per active project: status + next action.]

## INTELLIGENCE
[1-3 external developments. Relevant only. Nothing else.]

## DECISION FLAG
[Any pending decision sitting open more than 5 days.]
---

Save to: 04-JARVIS-OUTPUTS/briefings/[DATE]-morning-brief.md
Store in memory tagged: morning-brief, [DATE]
Send Telegram: "Morning brief ready — [THE ONE THING]"

## Quality Standard
Under 5 minutes to read. Every item vault-grounded.
Generic advice is failure. Specific insight is success.
