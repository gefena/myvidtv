## MODIFIED Requirements

### Requirement: Player-first layout on small screens
On viewports ≤600px wide, the system SHALL display the YouTube player at the top of the screen in a 16:9 aspect ratio, with the now-playing controls bar directly below it, and a Library access button at the bottom. The Library access button SHALL be visible regardless of the current playback mode (watch or listen). Tag filter buttons in the library sheet SHALL have a minimum tap target height of 44px.

#### Scenario: Player visible on mobile in watch mode
- **WHEN** the user is on a small screen with an item playing in watch mode
- **THEN** the player occupies the full width at 16:9 ratio, followed by the now-playing bar, followed by a Library peek button at the bottom

#### Scenario: Nothing playing on mobile
- **WHEN** the user is on a small screen and no item is selected
- **THEN** the library sheet is shown pre-expanded so the user can browse immediately

#### Scenario: Library button visible in listen mode
- **WHEN** the user is on a small screen and listen mode is active
- **THEN** the Library peek button is still visible so the user can open the library sheet and switch tracks

#### Scenario: Tag bar buttons are tappable on mobile
- **WHEN** the user views the tag filter bar on a small screen
- **THEN** each tag button has a minimum tap target height of 44px

### Requirement: Listen mode fills full screen on mobile
On small screens in listen mode, the system SHALL display the mini listen bar pinned at the bottom, and the Library peek button SHALL remain accessible above it so users can browse and switch tracks without leaving listen mode.

#### Scenario: Listen mode on mobile
- **WHEN** the user is on a small screen and switches to listen mode
- **THEN** the mini listen bar is fixed at the bottom with appropriate safe-area padding, and the Library peek button is visible above it

#### Scenario: User opens library while in listen mode
- **WHEN** the user taps the Library button while in listen mode on mobile
- **THEN** the library sheet opens and the user can select a different track; audio continues uninterrupted
