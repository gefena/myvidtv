## 1. Test Tooling Setup

- [x] 1.1 Add unit test dependencies for Vitest and TypeScript execution.
- [x] 1.2 Add browser smoke test dependencies for Playwright.
- [x] 1.3 Add `typecheck`, `test`, `test:unit`, `test:unit:watch`, `test:e2e`, `check`, and `check:all` scripts to `package.json`, with `test` as an alias for `test:unit`.
- [x] 1.4 Add Vitest configuration for TypeScript unit tests.
- [x] 1.5 Add Playwright configuration that starts or reuses the local Next.js dev server.

## 2. Unit Test Coverage

- [x] 2.1 Extract small pure helpers from existing modules where needed so import/export, watch-history retention, and progress reset logic can be tested without React rendering.
- [x] 2.2 Add unit tests for legacy import data without `watchHistory`.
- [x] 2.3 Add unit tests for watch-history retention: newest 50 entries and 180-day expiry.
- [x] 2.4 Add unit tests for watch-history merge by `ytId` using newest `lastWatchedAt`.
- [x] 2.5 Add unit tests for inclusive 95% completion reset behavior.
- [x] 2.6 Run `npm run test:unit` and fix failures.

## 3. Browser Smoke Coverage

- [x] 3.1 Add a desktop smoke test that opens the app and verifies the shell renders without an unhandled page error.
- [x] 3.2 Add a mobile smoke test that opens the app, reaches the Library entry point, and opens the mobile library sheet.
- [x] 3.3 Add a browser test setup helper that seeds local storage with library/watch-history data.
- [x] 3.4 Add a History smoke test that verifies seeded history is visible in the History view.
- [x] 3.5 Add a mobile History smoke test that selects a history row and verifies the sheet closes while app controls remain reachable.
- [x] 3.6 Ensure browser tests avoid assertions against real YouTube iframe playback.
- [x] 3.7 Run `npm run test:e2e` and fix failures.

## 4. Hooks and CI

- [x] 4.1 Add Git hook tooling and an install/prepare script that exits successfully when `.git` metadata is unavailable.
- [x] 4.2 Add a pre-commit hook that runs `npm run lint`.
- [x] 4.3 Add a pre-push hook that runs `npm run check`.
- [x] 4.4 Add a GitHub Actions workflow that runs `npm ci`, `npm run check`, installs Chromium for Playwright, and runs `npm run test:e2e`.
- [x] 4.5 Document the local verification commands and manual YouTube playback boundary.

## 5. Verification

- [x] 5.1 Run `npm run lint`.
- [x] 5.2 Run `npm run typecheck`.
- [x] 5.3 Run `npm run test:unit`.
- [x] 5.4 Run `npm run build`.
- [x] 5.5 Run `npm run check`.
- [x] 5.6 Run `npm run test:e2e`.
- [x] 5.7 Run `npm run check:all`.
- [x] 5.8 Confirm the pre-commit hook runs `npm run lint` by invoking the hook directly or through the hook tool without creating a throwaway commit.
- [x] 5.9 Confirm the pre-push hook runs `npm run check` by invoking the hook directly or through the hook tool without pushing to a remote.
