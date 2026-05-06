## Why

CI is failing on every push: the GitHub Actions quality job exits with code 1 due to a broken e2e selector introduced by the two-tone wordmark redesign, and emits a Node.js 20 deprecation warning because the action-runner fix and the pre-push hook described in `quality-gates` were never implemented.

## What Changes

- Fix the `getByText("MyVidTV")` e2e selector — the wordmark is now split across two `<span>` elements, causing an ambiguous or zero-match Playwright locator; replace with `toHaveTitle(/MyVidTV/)` which targets the page `<title>` instead of the DOM
- Add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env var to the CI quality job so that `actions/checkout` and `actions/setup-node` run on the Node 24 action runtime (distinct from `node-version`, which only sets the project runtime)
- Implement the pre-push git hook specified in `quality-gates` using `lefthook` so that `npm run check` runs automatically before every push, catching TypeScript errors, lint violations, unit-test failures, and build failures locally

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `automated-testing`: e2e selector for the desktop smoke test changes from `getByText("MyVidTV")` to `page.toHaveTitle(/MyVidTV/)` to match the split-span wordmark
- `quality-gates`: CI job gains the `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` env var; pre-push hook requirement is implemented via `lefthook`

## Impact

- `.github/workflows/quality.yml` — add `env` block to quality job
- `tests/e2e/app.spec.ts` — update desktop smoke selector
- `package.json` — add `lefthook` dev dependency; add `prepare` script to install hooks
- `lefthook.yml` — new config file defining pre-push hook
