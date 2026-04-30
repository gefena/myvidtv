## Why

MyVidTV currently relies on `npm run lint`, `npm run build`, manual browser checks, and developer discipline. Recent watch-history work showed that important behavior can be verified automatically if the project has a small test harness and a consistent quality gate before push.

## What Changes

- Add a unit test runner for deterministic application logic.
- Add browser smoke tests for high-value UI flows, including desktop and mobile viewport checks.
- Add package scripts for `typecheck`, unit tests, browser tests, and a single `check` command.
- Add Git hooks so fast checks run before commit and the full quality gate runs before push.
- Document which verification belongs in unit tests, browser tests, hooks, and manual checks.
- No breaking changes to product behavior.

## Capabilities

### New Capabilities
- `automated-testing`: Defines unit and browser smoke test coverage for deterministic logic and critical UI flows.
- `quality-gates`: Defines project scripts and Git hooks that run lint, typecheck, build, and tests at the right enforcement points.

### Modified Capabilities
- None.

## Impact

- `package.json` and `package-lock.json`: add scripts and test/hook dependencies.
- Test configuration files for the selected unit and browser test runners.
- New test files for pure logic and browser smoke coverage.
- Git hook configuration files.
- Developer workflow: local commits and pushes will run automated checks.
