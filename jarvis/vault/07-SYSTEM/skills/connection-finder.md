# connection-finder

## Purpose
Find strong connections between recent notes and existing vault content that
weren't made explicitly.

## Trigger
Scheduled nightly at 11:00 PM.
Manual: "Find connections" or "Connection finder"

## Process

STEP 1: Identify recent notes
List all notes in 01-KNOWLEDGE/ modified in last 48 hours.

STEP 2: For each recent note
Search the entire vault for existing notes with a strong connection.

Strong connection definition from CLAUDE.md:
Reading both notes together reveals something that reading either alone doesn't reveal.

NOT a connection: two notes mention the same topic.
IS a connection: reading them together produces an insight neither contains individually.

STEP 3: For each strong connection found
Name both notes.
Describe specifically what reading them together reveals.
Note whether the connection implies an action or update.
Assess: surprising or obvious?
Only include non-obvious connections.

STEP 4: Output each connection

---
# Connection: [NOTE A] <-> [NOTE B]
Date: [DATE]
Files: [[NOTE A]] and [[NOTE B]]

## What This Reveals
[What you see reading both that you miss reading either]

## Implication
[What this connection suggests to investigate or do]

## Surprise Level
[High / Medium — skip if obvious]
---

Save to: 04-JARVIS-OUTPUTS/connections/[DATE]-connections.md
Add wikilinks to the connection note from both original notes.
Store in memory tagged: connection, [DATE]

## Quality Standard
Ten strong surprising connections beats fifty obvious ones.
If a connection feels like it should have been explicit already skip it and
find the ones that genuinely reveal something new.
