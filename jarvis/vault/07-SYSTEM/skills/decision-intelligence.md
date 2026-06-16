# decision-intelligence

## Purpose
Structure incoming decisions and systematically review past decisions against
accumulated evidence.

## Trigger — Part A: Structure New Decision
File Trigger: New file in 00-INBOX/ containing "decision" in filename.
Manual: "Structure decision: [DECISION]"

## Trigger — Part B: Review Past Decisions
Scheduled every Monday at 9:00 AM.
Manual: "Decision review"

## Part A: Structuring Process

Read the raw decision content.
Read CLAUDE.md for current context.
Read memory for any relevant past decisions.

Produce structured decision note:

---
type: decision
date: [TODAY]
status: active
review_date: [SUGGEST BASED ON STAKES]
assumption: [CRITICAL ASSUMPTION]
---

# Decision: [TOPIC]

## What Was Decided
[Clear specific statement]

## The Real Reason
[Actual reasoning not post-hoc justification]

## Alternatives Rejected
[What else was on table and why rejected]

## The Critical Assumption
[Single belief this most depends on being true]

## What Success Looks Like
[Specific observable outcome]

## Early Warning Signs
[How to know this is going wrong early]

## Review Date
[When to assess against reality]
---

Save to: 01-KNOWLEDGE/decisions/[DATE]-[TOPIC].md
Archive raw inbox file.
Store in memory tagged: decision, [TOPIC], [DATE]

## Part B: Review Process

Read all active decision notes.
Find any with review_date before today.

For each overdue decision:
Read current vault for evidence about the outcome.
Compare the critical assumption to current evidence.

VALID: Assumption still holds, decision looks right.
CHALLENGED: New evidence complicates the assumption.
INVALIDATED: Evidence clearly contradicts the assumption.

Generate review:

---
# Decision Review: [TOPIC]
Original decision: [[DECISION NOTE]]

## Assumption Then
[What had to be true]

## Evidence Now
[What the vault shows]

## Status
[VALID / CHALLENGED / INVALIDATED]

## Recommended Action
[Keep / Revise / Reverse — with specific reasoning]
---

Save to: 04-JARVIS-OUTPUTS/[DATE]-decision-reviews.md
Send Telegram if any decisions are CHALLENGED or INVALIDATED.

## Quality Standard
The structure adds value by making the critical assumption explicit.
Most decisions go wrong because the assumption was never stated clearly enough
to be challenged.
The review adds value by comparing to evidence not to memory of how it felt.
