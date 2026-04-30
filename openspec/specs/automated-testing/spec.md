## ADDED Requirements

### Requirement: Unit tests cover deterministic application logic
The system SHALL provide an automated unit test suite for deterministic application logic that does not require a browser, network access, or a running Next.js server.

The unit test suite SHALL include coverage for high-risk pure logic introduced or used by the application, including import/export sanitation, watch-history retention, watch-history merge behavior, and playback progress reset calculations where those behaviors are implemented as testable helpers.

#### Scenario: Unit tests run from package script
- **WHEN** a developer runs the unit test package script
- **THEN** the unit test runner executes the unit test suite once and exits with a non-zero status if any unit test fails

#### Scenario: Legacy import behavior is tested
- **WHEN** the unit test suite runs
- **THEN** it verifies that legacy library imports without `watchHistory` are accepted and normalize watch history to an empty array

#### Scenario: Watch history retention is tested
- **WHEN** the unit test suite runs
- **THEN** it verifies that watch history keeps at most 50 newest entries and removes entries older than 180 days

#### Scenario: Completion reset is tested
- **WHEN** the unit test suite runs
- **THEN** it verifies that progress at 95% or more stores `lastPosition` and `lastWatchedRatio` as 0

### Requirement: Browser smoke tests cover first-party UI flows
The system SHALL provide browser smoke tests for critical first-party UI flows using deterministic app state and controlled desktop and mobile viewport sizes.

Browser smoke tests SHALL avoid asserting real YouTube iframe playback, real YouTube network behavior, or third-party iframe internals. Those behaviors SHALL remain manual verification concerns when changed.

#### Scenario: App loads on desktop viewport
- **WHEN** the browser smoke suite opens the app on a desktop viewport
- **THEN** the app renders successfully without an unhandled page error

#### Scenario: Mobile library sheet is reachable
- **WHEN** the browser smoke suite opens the app on a mobile viewport
- **THEN** the Library entry point is reachable and opens the mobile library sheet

#### Scenario: History view is reachable in browser tests
- **WHEN** browser test setup seeds local storage with a watch history entry
- **THEN** the History view is reachable and displays the seeded history row

#### Scenario: Mobile history selection closes the sheet
- **WHEN** a browser smoke test selects a history row from the mobile library sheet
- **THEN** the sheet closes and playback controls remain reachable in the app shell

### Requirement: Manual verification boundaries are explicit
The system SHALL document which behaviors are intentionally excluded from automated tests and require manual verification.

#### Scenario: Third-party playback remains manual
- **WHEN** a change depends on real YouTube iframe playback, resume timing, or embedded player state
- **THEN** the verification notes identify that behavior as manual rather than relying on automated browser tests
