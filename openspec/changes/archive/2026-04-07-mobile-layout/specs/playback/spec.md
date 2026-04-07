## ADDED Requirements

### Requirement: Playback controls are touch-accessible on mobile
On viewports ≤600px wide, the system SHALL render playback controls (play, pause, skip, listen toggle) and the progress bar with touch targets of at least 44px in the relevant dimension. The visual design of controls MAY remain unchanged; hit areas SHALL be expanded via padding or wrapper elements.

#### Scenario: Progress bar tappable on mobile
- **WHEN** the user taps the progress bar area on a small screen
- **THEN** the player seeks to the tapped position; the tap area SHALL be at least 44px tall even though the visual bar is 2px

#### Scenario: Control buttons tappable on mobile
- **WHEN** the user taps a playback control button (play, pause, skip, listen toggle) on a small screen
- **THEN** the action is reliably triggered; buttons SHALL have a minimum touch target height of 44px
