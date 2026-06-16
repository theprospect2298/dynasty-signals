# belief-tracker

## Purpose
Monitor accumulated vault content for evidence that supports or challenges
current beliefs listed in CLAUDE.md.

## Trigger
Scheduled every Monday at 8:00 AM.
Manual: "Belief update" or "Track beliefs"

## Process

STEP 1: Read current beliefs
Extract all beliefs from the Current Beliefs and Working Theories section of CLAUDE.md.

STEP 2: Read the week's additions
List all notes added to vault in past 7 days.
For each note assess relevance to each belief.

STEP 3: Assess each relevant note

CONFIRMS: Provides new evidence supporting the belief. Cite the specific claim in the note.

CHALLENGES: Provides evidence against or complicates the belief. Cite the specific claim.

COMPLICATES: Adds nuance without clearly supporting or challenging.

IRRELEVANT: No bearing. Skip entirely.

STEP 4: Report only CONFIRMS and CHALLENGES
Skip irrelevant and minor complications.
For CHALLENGES: assess severity.
Does this require belief revision or just acknowledgment of counter-evidence?

STEP 5: Recommend CLAUDE.md updates
For any belief with accumulated significant challenge evidence recommend specific update.

STEP 6: Output

---
# Belief Tracker — Week of [DATE]

## Confirmed This Week
Belief: [STATEMENT]
Evidence: [[NOTE]] — [specific supporting claim]

## Challenged This Week
Belief: [STATEMENT]
Evidence: [[NOTE]] — [specific challenging claim]
Severity: [MINOR / MODERATE / SIGNIFICANT]
Recommended action: [UPDATE / INVESTIGATE / ACKNOWLEDGE]

## CLAUDE.md Updates Recommended
[Specific wording changes for any beliefs where evidence has accumulated significantly]
---

Save to: 04-JARVIS-OUTPUTS/[DATE]-belief-tracker.md
Store in memory tagged: belief-tracker, [DATE]
Apply recommended CLAUDE.md updates when evidence clearly and significantly supports the change.

## Quality Standard
A challenge that doesn't change the belief at all is not worth reporting.
A challenge that requires investigation or update is worth reporting.
The belief tracker is only valuable if it is honest.
Confirmation bias is the enemy of this skill.
