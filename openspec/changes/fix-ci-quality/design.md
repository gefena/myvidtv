## Context

Three related CI problems surfaced together after the visual foundation redesign:

1. The wordmark split into two sibling `<span>` elements (`MyVid` + `TV`), making `page.getByText("MyVidTV")` ambiguous — Playwright's strict mode fails when multiple ancestor elements all have `"MyVidTV"` in their combined `textContent`.
2. Setting `node-version: 24` in `setup-node@v4` only changes the Node.js version for the project runtime. The action scripts themselves (`actions/checkout`, `actions/setup-node`) are pre-compiled Node 20 bundles — a separate opt-in env var is required to run them on Node 24.
3. The `quality-gates` spec has required a pre-push hook since it was written, but it was never implemented, so CI is the only quality gate.

## Goals / Non-Goals

**Goals:**
- Make the e2e suite green by fixing the broken desktop smoke-test selector
- Eliminate the GitHub Actions Node 20 deprecation warning from every CI run
- Implement the pre-push hook so `npm run check` blocks bad pushes locally

**Non-Goals:**
- Expanding e2e test coverage beyond fixing the broken selector
- Changing the visual design of the wordmark
- Running e2e tests in the pre-push hook (too slow; they require a dev server)

## Decisions

### 1. Replace `getByText("MyVidTV")` with `expect(page).toHaveTitle(/MyVidTV/)`

The page `<title>` ("MyVidTV — Your Personal TV") is a single text node and not subject to DOM ancestry ambiguity. `toHaveTitle` is the canonical Playwright assertion for page-level identity.

Alternatives considered:
- `page.getByRole("banner").getByText("MyVidTV")` — still potentially ambiguous within the banner; more fragile to layout changes
- `page.locator("header").getByText("MyVidTV")` — relies on the `<header>` element staying in place
- `page.getByText("MyVidTV").first()` — silently masks future selector regressions by picking the first match

### 2. Fix CI Node 20 warning with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`

Adding this env var at the job level opts the action runner into Node 24 without waiting for GitHub to release new action versions. It is the documented opt-in mechanism per the GitHub changelog.

Alternatives considered:
- Waiting for newer action releases that target Node 24 natively — unpredictable timeline, warning persists
- Pinning to specific SHA commits of the actions — maintenance burden, doesn't fix the underlying warning

### 3. Implement pre-push hook with `lefthook`

`lefthook` is a single-binary tool with zero transitive dependencies that installs via npm and configures git hooks declaratively in `lefthook.yml`. It installs hooks during `npm install` via the `prepare` lifecycle script.

The pre-push hook runs `npm run check` (lint + typecheck + unit tests + build). This mirrors exactly what CI runs in the "Run core quality checks" step, so local and CI gates are identical.

Alternatives considered:
- `husky` — more popular, but adds more scaffolding and a post-install script with shell evals; `lefthook` is simpler for a personal project
- Raw `.git/hooks/pre-push` shell script — not committed to the repo, requires manual setup on each clone

**Hook install safety in CI:** `lefthook install` exits successfully even when there is no `.git` directory (relevant if the repo is checked out without Git metadata). The `prepare` script is therefore safe to run in CI.

## Risks / Trade-offs

- **Slow pushes** — `npm run check` includes a full Next.js production build (~10–15s). Acceptable given that CI would catch it anyway; `--no-verify` is always available as an escape hatch.
- **`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`** is a temporary opt-in env var. Once GitHub makes Node 24 the default for actions (June 2026), the var becomes a no-op and can be removed.

## Migration Plan

1. Merge the change — `lefthook` hooks are installed automatically on the next `npm install`
2. Existing clones need `npm install` (or `npx lefthook install`) once to activate the hook
3. No rollback needed; if the hook causes friction, `git push --no-verify` bypasses it
