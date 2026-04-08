## MODIFIED Requirements

### Requirement: Brand mark displayed in header
The system SHALL display a proprietary SVG brand mark in the header alongside the wordmark. The viewport-frame stroke SHALL use `currentColor` (resolved via `color: var(--text-muted)`) so it renders visibly in both dark and light themes.

#### Scenario: Header renders on desktop
- **WHEN** the user views the app on any viewport
- **THEN** the header shows the SVG viewport mark (rounded rect + violet circle) at 24px height beside the wordmark

#### Scenario: Mark renders in light theme
- **WHEN** the user switches to light theme
- **THEN** the viewport frame stroke is visible (not white-on-white), rendered in the muted text color

#### Scenario: Mark renders consistently across browsers
- **WHEN** the app is opened in any modern browser
- **THEN** the SVG mark renders identically — not dependent on OS emoji fonts
