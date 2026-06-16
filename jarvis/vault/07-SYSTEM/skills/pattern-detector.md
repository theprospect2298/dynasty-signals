# pattern-detector

## Purpose
Identify genuine patterns across thirty days of accumulated knowledge that would
be invisible at the scale of any individual week.

## Trigger
Scheduled on the 1st of every month at 8:00 AM.
Manual: "Detect patterns" or "Monthly patterns"

## Process

STEP 1: Gather the month
Read all permanent notes created in past 30 days.
Read all weekly syntheses from past 4 weeks.
Read all belief tracker outputs from past 4 weeks.
Read current patterns in 01-KNOWLEDGE/patterns/ if exists.

STEP 2: Look for structural patterns
A pattern is NOT a shared topic.
A pattern is a structural similarity across multiple notes from different contexts.

Pattern types to find:

RECURRENCE: Same dynamic appearing in different domains or contexts.

CONVERGENCE: Multiple independent sources pointing to the same conclusion.

CONTRADICTION: Evidence accumulating against a current belief that hasn't triggered an update.

EMERGENCE: Something new appearing that wasn't present in previous months.

BLIND SPOT: Topics recurring in captures without corresponding permanent notes.
Suggests avoidance or under-processing.

STEP 3: Evidence requirement
Minimum four independent notes demonstrating the pattern from different contexts.
Two notes on the same topic is not a pattern.

STEP 4: For each genuine pattern

PATTERN NAME: [Memorable specific name]
TYPE: [From five types above]
EVIDENCE: [Four or more specific notes with brief description of how each demonstrates pattern]
IMPLICATION: [What this pattern means for current work or beliefs]
RECOMMENDED ACTION: [Specific response]

STEP 5: Update knowledge base
Add confirmed patterns to 01-KNOWLEDGE/patterns/
Recommend CLAUDE.md updates for patterns that change active beliefs or priorities.

Save to: 04-JARVIS-OUTPUTS/patterns/[DATE]-patterns.md
Store in memory tagged: pattern-detector, [DATE]
Send Telegram: "Monthly patterns ready — [N] patterns found"

## Quality Standard
One genuine pattern is worth ten superficial ones.
The test: would this pattern be obvious to anyone reading the notes? If yes it's
not worth naming. Would it require reading all thirty days simultaneously to see?
That's a genuine pattern.
