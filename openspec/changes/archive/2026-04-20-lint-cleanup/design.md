## Context

MyVidTV is a single-workspace Next.js application with UI state, client hooks, API routes, and OpenSpec artifacts living in the same repository. The requested change is a maintenance pass rather than a feature: run the existing lint workflow, fix reported issues, and keep user-visible behavior unchanged.

The main constraint is behavioral safety. Lint fixes may require refactors across multiple modules, but they must not alter playback flows, library state behavior, API route contracts, or theming.

## Goals / Non-Goals

**Goals:**
- Identify the current lint failures in the workspace
- Apply the smallest safe code changes needed to satisfy lint rules
- Re-verify lint after changes
- Preserve current user-facing and API behavior

**Non-Goals:**
- Feature work unrelated to lint findings
- Visual redesigns or UX changes
- Refactors that are larger than what lint compliance requires
- Introducing new dependencies purely for style or tooling preference

## Decisions

Keep the cleanup scoped to existing tooling.
Rationale: `npm run lint` is already the repo standard, so the change should optimize for clearing the current signal rather than changing the lint stack.
Alternative considered: changing ESLint rules to suppress findings. Rejected because it weakens the code-quality baseline instead of fixing the code.

Prefer minimal, localized fixes over broad refactors.
Rationale: the user asked for a clean codebase without breaking anything, so the safest approach is to change only the files implicated by actual lint findings.
Alternative considered: sweeping style refactors across the app. Rejected because that increases regression risk without additional product value.

Verify after cleanup with the same lint command and targeted sanity checks based on touched code.
Rationale: maintenance work still needs confirmation that no regressions were introduced, especially when lint fixes touch hooks, components, or API routes.
Alternative considered: trusting lint alone as sufficient proof. Rejected because some safe-looking refactors can still change runtime behavior.

## Risks / Trade-offs

[Lint fixes may subtly change runtime logic] -> Keep edits narrow, avoid opportunistic refactors, and sanity-check affected flows after the cleanup.

[Some findings may reflect architectural issues rather than isolated mistakes] -> Fix only what is required for lint compliance and document any deferred follow-up work separately.

[A clean lint run may still leave untested runtime regressions] -> Run lint again and perform targeted verification based on the touched modules.
