## ADDED Requirements

### Requirement: Project exposes layered quality scripts
The system SHALL expose package scripts for linting, typechecking, unit testing, browser smoke testing, and combined quality checks.

The `test` script SHALL run the unit test suite once. The default combined quality check SHALL run lint, typecheck, unit tests, and production build. A separate complete check SHALL include browser smoke tests.

#### Scenario: Typecheck script exists
- **WHEN** a developer runs the typecheck package script
- **THEN** TypeScript checks the project without emitting build output

#### Scenario: Test script runs unit tests
- **WHEN** a developer runs the `test` package script
- **THEN** the unit test suite runs once and exits with a non-zero status if any unit test fails

#### Scenario: Default quality check runs core checks
- **WHEN** a developer runs the default quality check package script
- **THEN** lint, typecheck, unit tests, and production build run in a deterministic order

#### Scenario: Complete quality check includes browser smoke tests
- **WHEN** a developer runs the complete quality check package script
- **THEN** the default quality check runs and browser smoke tests also run

### Requirement: Git hooks enforce local quality gates
The system SHALL configure Git hooks that run automated checks before code is committed or pushed.

The pre-commit hook SHALL run a fast check suitable for frequent commits. The pre-push hook SHALL run the default quality check.

#### Scenario: Pre-commit runs fast check
- **WHEN** a developer creates a commit through Git hooks
- **THEN** the pre-commit hook runs the lint package script and blocks the commit if lint exits non-zero

#### Scenario: Pre-push runs default quality check
- **WHEN** a developer pushes through Git hooks
- **THEN** the pre-push hook runs the default quality check and blocks the push if any core check exits non-zero

#### Scenario: Hooks are installable after dependency install
- **WHEN** a developer installs project dependencies
- **THEN** the configured Git hook tool installs or prepares the repository hooks without requiring manual file copying

#### Scenario: Hook preparation is safe without Git metadata
- **WHEN** dependencies are installed in CI, package build, or another non-interactive environment without a `.git` directory
- **THEN** hook preparation exits successfully without requiring manual intervention

### Requirement: CI enforces shared quality gates
The system SHALL provide a CI workflow that verifies pushed code in a clean environment.

The CI workflow SHALL run dependency installation, the default quality check, and browser smoke tests. Browser dependency installation SHALL be scoped to the browser family used by the smoke suite.

#### Scenario: CI runs on pull request or push
- **WHEN** code is pushed or a pull request is opened against the configured branch
- **THEN** CI installs dependencies and runs the default quality check

#### Scenario: CI runs browser smoke tests
- **WHEN** CI runs successfully through the default quality check
- **THEN** CI installs the required Chromium browser test dependencies and runs browser smoke tests
