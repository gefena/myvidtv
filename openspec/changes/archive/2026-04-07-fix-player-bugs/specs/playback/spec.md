## MODIFIED Requirements

### Requirement: Watch / Listen toggle
The system SHALL provide a toggle that switches between Watch mode (full video player visible) and Listen mode (player hidden via CSS, audio continues, mini bar shown at bottom). The selected mode SHALL persist across page reloads. In Listen mode, only the mini player bar SHALL be visible — the inline now-playing bar SHALL be hidden.

#### Scenario: User switches to Listen mode
- **WHEN** the user activates the Listen toggle
- **THEN** the video player is hidden via CSS (not removed from DOM) and a mini player bar appears at the bottom of the screen with title and playback controls

#### Scenario: User switches back to Watch mode
- **WHEN** the user activates the Watch toggle
- **THEN** the full video player is shown again and the mini bar is hidden

#### Scenario: Listen mode preserves playback position
- **WHEN** the user switches to Listen mode while a video is playing
- **THEN** audio continues uninterrupted from the same position

#### Scenario: Listen mode restored after page reload
- **WHEN** the user reloads the page while in Listen mode
- **THEN** the player initializes in Listen mode (mini bar layout, player hidden)

#### Scenario: Only one control bar is visible at a time
- **WHEN** the player is in Listen mode and an item is playing
- **THEN** only the fixed mini bar is visible — the inline now-playing bar is not rendered

### Requirement: Basic playback controls
The system SHALL expose play, pause, skip-to-next, and seek controls.

#### Scenario: User pauses playback
- **WHEN** the user clicks the pause control
- **THEN** the YouTube player pauses

#### Scenario: User skips to next
- **WHEN** the user clicks the skip control
- **THEN** the next item in the queue begins playing

#### Scenario: User seeks via progress bar
- **WHEN** the user clicks a position on the progress bar
- **THEN** the YouTube player seeks to the proportional position in the current video
