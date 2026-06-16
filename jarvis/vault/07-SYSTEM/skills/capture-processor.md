# capture-processor

## Purpose
Process all daily note captures and route them to the correct vault locations
automatically.

## Trigger
Scheduled daily at 8:00 PM.
Manual: "Process today" or "File captures"

## Process

STEP 1: Read today's daily note
Extract everything in the Captures section.
If no captures: log and stop. Do not fail.

STEP 2: Read CLAUDE.md for routing context
Understand current projects and structure.

STEP 3: For each captured item identify type

IDEA: Worth keeping as permanent knowledge
-> Create atomic note in 01-KNOWLEDGE/permanent/
-> Write in first person, own words, own understanding
-> Find two connections to existing notes
-> Add The Tension section

TASK: Something to do
-> Add to relevant project in 02-PROJECTS/
-> If project unclear: add to 00-INBOX/tasks.md

DECISION: Significant choice made or pending
-> Create decision note in 01-KNOWLEDGE/decisions/
-> Format: DECISION / CONTEXT / ASSUMPTION / REVIEW DATE

REFERENCE: Keep for later
-> File in 05-RESOURCES/ under relevant topic

INSIGHT: Realization or synthesis
-> Create insight note in 01-KNOWLEDGE/insights/
-> Connect to relevant permanent notes

STEP 4: Update CLAUDE.md
If any project status changed today update it directly.

STEP 5: Prepare tomorrow
If today's note has explicit tomorrow items:
Add them to tomorrow's daily note as open loops.

STEP 6: Report
Generate processing summary:
[N] permanent notes created
[N] tasks filed to projects
[N] decisions logged
[N] items carried to tomorrow

Save summary to: 04-JARVIS-OUTPUTS/[DATE]-processing.md
Store in memory tagged: capture-processed, [DATE]

## Quality Standard
Nothing remains in Captures after processing.
Every item filed or explicitly dropped.
Permanent notes written in first person understanding.
Never direct quotes as permanent notes.
