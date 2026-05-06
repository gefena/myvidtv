## MODIFIED Requirements

### Requirement: Browser smoke tests cover first-party UI flows
The system SHALL provide browser smoke tests for critical first-party UI flows using deterministic app state and controlled desktop and mobile viewport sizes.

Browser smoke tests SHALL avoid asserting real YouTube iframe playback, real YouTube network behavior, or third-party iframe internals. Those behaviors SHALL remain manual verification concerns when changed.

Browser smoke tests SHALL use stable, unambiguous Playwright locators. Page-level identity assertions SHALL use `toHaveTitle` rather than DOM text selectors to avoid false failures from wordmark markup changes.

#### Scenario: App loads on desktop viewport
- **WHEN** the browser smoke suite opens the app on a desktop viewport
- **THEN** the page title matches `/MyVidTV/` and no unhandled page error is raised

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
