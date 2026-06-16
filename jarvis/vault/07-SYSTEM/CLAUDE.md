# Jarvis Configuration — CLAUDE.md

> The most important document in this system. Every skill reads it before
> executing, and every output is calibrated to what's here. Spend two hours on
> it up front. Update it every Monday. Replace every [BRACKETED] placeholder
> with the truth — not aspirations.

## Identity
Name: [YOUR NAME]
Primary work: [SPECIFIC DESCRIPTION OF WHAT YOU DO]
Current stage: [WHERE YOU ARE IN YOUR WORK OR LIFE]
Location and timezone: [CITY, TIMEZONE]

## How I Actually Work
[Honest description of your working style. Not how you want to work. How you
actually work. When are you most productive? What derails you? What types of
tasks energize you? What drains you?]

## Current Focus Areas
[8-12 specific topics you are actively thinking about. Not broad interests.
Specific enough that Jarvis can recognize when new information is relevant.]

1. [SPECIFIC FOCUS AREA]
2. [SPECIFIC FOCUS AREA]
3. [SPECIFIC FOCUS AREA]
4. [SPECIFIC FOCUS AREA]
5. [SPECIFIC FOCUS AREA]
6. [SPECIFIC FOCUS AREA]
7. [SPECIFIC FOCUS AREA]
8. [SPECIFIC FOCUS AREA]

## Active Projects
[PROJECT NAME]: [One sentence current status]
Next action: [Specific step]
Priority: [HIGH/MEDIUM/LOW]
Deadline: [DATE IF APPLICABLE]

[PROJECT NAME]: [One sentence current status]
Next action: [Specific step]
Priority: [HIGH/MEDIUM/LOW]
Deadline: [DATE IF APPLICABLE]

## Current Beliefs and Working Theories
[The positions you currently hold that new evidence might support or challenge.
Update monthly. The belief tracker (Monday) reads these by name.]

Belief 1: [STATEMENT]
Evidence supporting: [WHAT BACKS THIS UP]
Evidence against: [WHAT CHALLENGES IT]
Confidence: [HIGH/MEDIUM/LOW]

Belief 2: [STATEMENT]
Evidence supporting: [WHAT BACKS THIS UP]
Evidence against: [WHAT CHALLENGES IT]
Confidence: [HIGH/MEDIUM/LOW]

## Active Questions
[Questions you are currently working to answer. Not topics you are interested
in. Specific questions you are actively investigating.]

1. [SPECIFIC QUESTION]
2. [SPECIFIC QUESTION]

## Decision History Context
I make better decisions when: [CONDITIONS]
I make worse decisions when: [CONDITIONS]
Known biases: [HONEST SELF-ASSESSMENT]

## Content and Output Standards
[If you create content or professional outputs: voice, format, quality
standards, what you never publish.]

## What Jarvis Has Permission to Do Autonomously
- Read any file in the vault
- Write to 04-JARVIS-OUTPUTS/ only
- Search externally for information relevant to focus areas
- Update memory database

## What Requires Human Approval
- Writing to any vault location outside 04-JARVIS-OUTPUTS
- Any communication to external parties
- Any financial or strategic recommendation beyond analysis

> Note on the capture processor, belief tracker, and decision intelligence
> skills: these file notes into 01-KNOWLEDGE/ and may apply CLAUDE.md updates.
> That is intentional and is the one sanctioned exception to the rule above.
> The runner's `WRITE_SCOPE` setting governs which paths are actually writable;
> set it to `outputs-only` if you want every other write to require your hand.

## Intelligence Standards
Strong signal: information that would change a decision or challenge a current belief.
Weak signal: interesting but not relevant to current work.
Noise: everything else. Never include.

## Memory Instructions
Always store in memory:
- Significant outputs with quality assessment
- Edge cases encountered and how handled
- Patterns identified with supporting evidence
- Belief updates triggered by new information
- Project status changes with dates

## Update Protocol
Every Monday morning: review and update this file.
Priority: active projects and current beliefs weekly.
Focus areas and decision context: monthly.
Everything else: when it changes.
