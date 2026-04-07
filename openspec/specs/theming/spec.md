# theming Specification

## Purpose
Defines the theming system. All colors are CSS custom properties on `data-theme`. Dark cinematic (violet accent) is the default. A light theme is available via toggle. Theme preference persists across sessions with no flash on load.

## Requirements

### Requirement: Dark cinematic theme is the default
The system SHALL apply the dark cinematic theme on first load, using near-black backgrounds, violet accent (#7C3AED), and white text.

#### Scenario: First visit, no theme preference stored
- **WHEN** the user opens the site for the first time
- **THEN** the dark theme is applied with no flash of unstyled content

### Requirement: Light theme is available via toggle
The system SHALL provide a theme toggle that switches between dark and light themes. The light theme uses warm off-white backgrounds and the same violet accent.

#### Scenario: User activates light theme
- **WHEN** the user clicks the theme toggle
- **THEN** the site switches to the light theme immediately without a page reload

#### Scenario: User switches back to dark theme
- **WHEN** the user clicks the theme toggle again
- **THEN** the site returns to the dark theme

### Requirement: Theme preference persists across sessions
The system SHALL store the user's theme preference in localStorage and apply it before first paint to avoid flash.

#### Scenario: User reloads after selecting light theme
- **WHEN** the user has selected light theme and reloads the page
- **THEN** the light theme is applied immediately on load with no dark flash

### Requirement: All color values use CSS custom properties
The system SHALL define all theme colors as CSS custom properties on `:root[data-theme]` so that no component contains hard-coded color values.

#### Scenario: Theme token defined
- **WHEN** a component renders a background or text color
- **THEN** it references a CSS custom property (e.g., `var(--bg)`, `var(--violet)`) rather than a literal color value
