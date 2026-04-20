## Why

The workspace needs a focused maintenance pass to clear lint issues before they accumulate into noisier builds, harder reviews, and avoidable regressions. This should happen now so future feature work starts from a clean baseline without changing user-visible behavior.

## What Changes

- Run the project's lint checks and identify the current failures and warnings.
- Apply code-only fixes needed to satisfy lint rules without changing product behavior, UI flows, or API contracts.
- Verify that the cleanup does not introduce functional regressions and leaves the repo in a clean lint state.

## Capabilities

### New Capabilities
- `lint-hygiene`: Define the requirement that the workspace can be brought to a lint-clean state through non-behavioral maintenance changes.

### Modified Capabilities

## Impact

- Affected code: application files that currently violate ESLint or TypeScript-adjacent lint rules
- Tooling: `npm run lint`
- Risk area: accidental behavioral changes while refactoring for lint compliance
