## ADDED Requirements

### Requirement: Listen mode mini bar shows playback progress
The system SHALL display a thin progress bar in the listen mode mini bar indicating current playback position (0–100%) for videos. The bar SHALL be clickable to seek, consistent with the watch mode progress bar.

#### Scenario: Progress bar reflects current position
- **WHEN** a video is playing in Listen mode
- **THEN** the mini bar shows a progress bar that updates as playback advances

#### Scenario: User seeks via listen mode progress bar
- **WHEN** a video (not a playlist-channel) is playing in Listen mode and the user clicks a position on the progress bar
- **THEN** the YouTube player seeks to the proportional position in the current video

#### Scenario: Progress bar not shown for playlist-channels
- **WHEN** a playlist-channel is playing in Listen mode
- **THEN** no progress bar is shown (playlist position is managed by YouTube's native player)
