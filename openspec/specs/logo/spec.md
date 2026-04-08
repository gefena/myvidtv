## Requirements

### Requirement: Brand mark displayed in header
The system SHALL display a proprietary SVG brand mark in the header alongside the wordmark, replacing the generic `▶` emoji placeholder.

#### Scenario: Header renders on desktop
- **WHEN** the user views the app on any viewport
- **THEN** the header shows the SVG viewport mark (rounded rect + violet circle) at 24px height beside the wordmark

#### Scenario: Mark renders consistently across browsers
- **WHEN** the app is opened in any modern browser
- **THEN** the SVG mark renders identically — not dependent on OS emoji fonts

### Requirement: Two-tone wordmark
The system SHALL render the app name as a two-tone wordmark: "MyVid" in normal weight/muted color and "TV" in violet semibold, expressing the brand's cinematic and personal identity.

#### Scenario: Wordmark visible in header
- **WHEN** the user views the header
- **THEN** "MyVid" appears in muted text color and "TV" appears in violet at higher weight

### Requirement: Favicon uses the brand mark
The system SHALL use the viewport mark (rounded-corner frame + violet dot) as the favicon (`icon.svg`), replacing the plain play triangle.

#### Scenario: Browser tab shows favicon
- **WHEN** the app is open in a browser tab
- **THEN** the favicon displays the rounded frame + violet circle mark on a dark background
