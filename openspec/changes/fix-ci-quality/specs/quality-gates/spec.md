## MODIFIED Requirements

### Requirement: Git hooks enforce local quality gates
The system SHALL configure Git hooks that run automated checks before code is committed or pushed.

The pre-commit hook SHALL run a fast check suitable for frequent commits. The pre-push hook SHALL run the default quality check. Hooks SHALL be managed by `lefthook` and installed automatically via the `prepare` npm lifecycle script so that no manual file copying is required after cloning.

#### Scenario: Pre-commit runs fast check
- **WHEN** a developer creates a commit through Git hooks
- **THEN** the pre-commit hook runs the lint package script and blocks the commit if lint exits non-zero

#### Scenario: Pre-push runs default quality check
- **WHEN** a developer pushes through Git hooks
- **THEN** the pre-push hook runs the default quality check and blocks the push if any core check exits non-zero

#### Scenario: Hooks are installable after dependency install
- **WHEN** a developer installs project dependencies
- **THEN** `lefthook` installs the repository hooks without requiring manual file copying

#### Scenario: Hook preparation is safe without Git metadata
- **WHEN** dependencies are installed in CI, package build, or another non-interactive environment without a `.git` directory
- **THEN** hook preparation exits successfully without requiring manual intervention

### Requirement: CI enforces shared quality gates
The system SHALL provide a CI workflow that verifies pushed code in a clean environment.

The CI workflow SHALL run dependency installation, the default quality check, and browser smoke tests. Browser dependency installation SHALL be scoped to the browser family used by the smoke suite. The CI job SHALL run GitHub Action scripts on Node.js 24 by opting in via the `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` environment variable.

#### Scenario: CI runs on pull request or push
- **WHEN** code is pushed or a pull request is opened against the configured branch
- **THEN** CI installs dependencies and runs the default quality check

#### Scenario: CI runs browser smoke tests
- **WHEN** CI runs successfully through the default quality check
- **THEN** CI installs the required Chromium browser test dependencies and runs browser smoke tests

#### Scenario: CI action scripts run on Node.js 24
- **WHEN** the CI quality job runs
- **THEN** GitHub Action scripts execute on the Node.js 24 runtime and emit no Node.js 20 deprecation warnings
