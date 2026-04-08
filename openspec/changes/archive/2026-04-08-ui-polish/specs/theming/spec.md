## MODIFIED Requirements

### Requirement: Light theme is available via toggle
The system SHALL provide a theme toggle that switches between dark and light themes. The light theme SHALL use violet-tinted off-white backgrounds (`--bg: #eeeef8`, `--surface: #f7f6ff`) rather than pure white, maintaining the violet brand identity in light mode.

#### Scenario: User activates light theme
- **WHEN** the user clicks the theme toggle
- **THEN** the site switches to the light theme with off-white, violet-tinted surfaces (not pure white)

#### Scenario: User switches back to dark theme
- **WHEN** the user clicks the theme toggle again
- **THEN** the site returns to the dark theme
