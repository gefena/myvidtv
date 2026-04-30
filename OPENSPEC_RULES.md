# OpenSpec Workflow Rules

Apply these rules when working on any project that uses OpenSpec.
This file is the source of truth for workflow behavior — implement each rule
using whatever mechanisms your environment supports.

---

## Rule 1: Review after openspec-propose

After completing `/opsx:propose` (proposal, design, specs, and tasks are all created),
conduct an inline review before declaring readiness to implement:

- Does the proposal clearly state the problem and goals?
- Is the design coherent, realistic, and internally consistent?
- Are specs clear and complete?
- Are tasks achievable, properly sized, and correctly sequenced?
- Are there gaps or contradictions between artifacts?

Surface issues found. Ask the user to resolve critical gaps before moving to implementation.

---

## Rule 2: Review after openspec-apply

After completing `/opsx:apply` (all implementation tasks done), conduct an inline
review before archiving:

- Was everything in the task list implemented?
- Does the implementation match the design?
- Are there obvious gaps, regressions, or missing pieces?

Then prompt the user:

> "Is this the right time to establish tests? Two kinds are worth considering:
> - **Code tests** — automated, for behavior that can be verified programmatically
> - **AI assistant tests** — for goals and qualities that code cannot verify (see Rule 4)"

---

## Rule 3: Compress context after openspec-archive

After completing `/opsx:archive`, remind the user to compress the conversation context:

> "Change archived. Consider compressing context before starting new work —
> use `/compact` or your assistant's equivalent."

---

## Rule 4: Testing philosophy

When there is enough code, strive for meaningful tests — not for coverage, but to
genuinely verify the work.

**Code tests** (always relevant when there is enough code)
Automated, deterministic. Unit tests, integration tests, API contracts.
Write these when behavior can be verified programmatically.

**AI assistant tests** (relevant only when the project has goals code cannot verify)
This is the ground humans usually cover in review — things a thoughtful reviewer
would check that no test suite can catch. Examples:
- Did the AI-generated output meet the quality bar set in the proposal?
- Does the UX flow feel right and match the intended experience?
- Does the implementation fulfill the goals stated in the proposal?
- Are there qualitative outcomes that need judgment rather than assertion?

AI assistant tests are not relevant for every project. Apply judgment: if success
criteria are fully capturable by code tests, skip them. If there are meaningful
human-judgment aspects — create explicit AI review tasks.

The goal of AI assistant tests is to narrow the gap between "tests pass" and
"a human would sign off on this."
