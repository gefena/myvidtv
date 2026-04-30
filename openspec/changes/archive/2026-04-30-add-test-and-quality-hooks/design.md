## Context

MyVidTV is a single Next.js application with client-side library state, API routes, OpenSpec artifacts, and no configured test runner. The current project scripts are limited to `dev`, `build`, `start`, and `lint`. Verification has been mostly manual plus `npm run lint`, `npm run build`, and targeted `curl` checks.

The new quality workflow should catch deterministic regressions locally without making normal commits painful. Browser/mobile behavior still matters for this app, but YouTube iframe behavior should not become a brittle automated dependency.

## Goals / Non-Goals

**Goals:**
- Add deterministic unit tests for pure application logic.
- Add browser smoke tests for first-party UI flows, including mobile viewport behavior.
- Add one standard quality command for lint, typecheck, unit tests, and build.
- Add Git hooks that run appropriate checks before commit and before push.
- Keep manual verification for third-party iframe playback and other browser behaviors that cannot be reliably automated.

**Non-Goals:**
- Do not require automated tests to interact with the real YouTube iframe.
- Do not chase line coverage targets.
- Do not rewrite application architecture just to make all components unit-testable.
- Do not block every commit on slow browser tests.

## Decisions

### Use Vitest for unit tests

Add Vitest as the unit test runner and configure it for TypeScript. Unit tests should focus on deterministic logic such as:
- import/export sanitation and legacy import behavior
- watch-history retention and merge rules
- progress reset threshold behavior
- URL parsing and metadata helpers where practical

Rationale: Vitest is lightweight, fast, and fits TypeScript/React projects without requiring a separate Jest stack.

Alternative considered: Jest. Rejected because it is heavier to configure for this current Next/TypeScript setup and does not add a clear benefit for the initial pure-logic tests.

### Use Playwright for browser smoke tests

Add Playwright for end-to-end smoke coverage. Initial tests should exercise first-party UI and layout behavior against the local app:
- app loads successfully on desktop
- library sheet is reachable on mobile viewport
- History navigation is visible when local storage contains watch history
- mobile history rows keep stable controls and selecting a row closes the sheet

Rationale: the project has meaningful responsive UI risk, and Playwright can verify first-party layout and interaction better than unit tests.

Alternative considered: no browser tests. Rejected because recent work had mobile-specific acceptance criteria that could not be covered by lint/build/unit checks alone.

### Do not automate real YouTube playback assertions

Browser smoke tests should avoid depending on actual YouTube iframe playback, timing, network availability, or embedded player state. Tests may seed local storage and assert MyVidTV UI behavior around selected items, but true playback/resume should remain a manual verification item when changed.

Rationale: third-party iframes are slow, flaky, and opaque to test automation. The automated suite should be reliable enough to run regularly.

Alternative considered: deep iframe playback automation. Rejected because it would create high maintenance cost and unreliable CI.

### Add layered package scripts

Add scripts along these lines:
- `typecheck`: `tsc --noEmit`
- `test`: alias for the unit test suite
- `test:unit`: run Vitest once
- `test:unit:watch`: run Vitest in watch mode
- `test:e2e`: run Playwright tests
- `check`: run lint, typecheck, unit tests, and build
- `check:all`: run `check` plus browser smoke tests

Rationale: contributors need clear commands for fast local verification and complete verification.

Alternative considered: one `test` command that runs everything. Rejected because browser tests are slower and need browser binaries, so they should be explicit.

### Add Git hooks with a lightweight pre-commit and stronger pre-push

Use a Node-friendly Git hook tool, preferably Husky, with:
- `pre-commit`: run `npm run lint`
- `pre-push`: run `npm run check`

Rationale: lint feedback is fast enough for every commit, while build/typecheck/unit tests are better suited to push-time enforcement.

Alternative considered: run `npm run build` on pre-commit. Rejected because Next builds are slow enough to discourage small commits.

### Add CI as server-side enforcement

Add a GitHub Actions workflow that runs `npm ci`, `npm run check`, installs the Playwright browser dependency used by the smoke suite, and runs `npm run test:e2e`.

The browser install step should install only the browser family used by the smoke tests, initially Chromium, using a command such as `npx playwright install --with-deps chromium`.

Rationale: local hooks can be bypassed; CI provides a shared verification result for pushed code.

Alternative considered: local hooks only. Rejected because local-only enforcement does not protect shared branches.

## Risks / Trade-offs

- [Risk] Browser tests become flaky due to animations or third-party embeds. → Mitigation: keep tests focused on first-party UI state, use deterministic local storage seeding, and avoid YouTube iframe assertions.
- [Risk] Git hooks slow down development. → Mitigation: keep pre-commit to lint only and reserve the fuller gate for pre-push.
- [Risk] Unit tests require access to logic currently embedded in React contexts or components. → Mitigation: extract small pure helpers only when needed and keep behavior unchanged.
- [Risk] CI adds dependency installation time. → Mitigation: keep the initial browser smoke suite small.
- [Risk] Existing lint warnings make hook output noisy. → Mitigation: hooks may allow warnings initially if the existing lint command exits successfully; a future lint cleanup can enforce zero warnings if desired.
- [Risk] Hook preparation fails in CI, package builds, or environments without a `.git` directory. → Mitigation: use a hook preparation command that exits successfully when Git metadata is unavailable.

## Migration Plan

1. Add test and hook dependencies.
2. Add package scripts and configuration files.
3. Add focused unit tests for existing pure logic.
4. Add focused browser smoke tests for desktop/mobile shell behavior.
5. Add Git hooks and CI workflow.
6. Verify `npm run check` and `npm run check:all` locally.
7. Verify hook scripts by invoking them directly or through the hook tool without creating throwaway commits or pushes.

Rollback is straightforward: remove the new dependencies, scripts, test/config files, hooks, and CI workflow. Product runtime behavior should be unaffected.
