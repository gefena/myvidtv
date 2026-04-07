# listen-mode-progress Specification

## Purpose
Defines how playback progress is tracked and displayed while the player is in Listen mode. The mini player bar SHALL show a progress indicator reflecting the current playback position so the user can monitor and seek without switching back to Watch mode.

## Requirements

### Requirement: Progress bar is visible in the mini player bar
The system SHALL render a progress bar inside the mini player bar when Listen mode is active and an item is playing.

#### Scenario: Progress bar appears in Listen mode
- **WHEN** the user is in Listen mode and a video is playing
- **THEN** the mini player bar displays a progress bar showing elapsed time relative to total duration

#### Scenario: Progress bar updates continuously
- **WHEN** a video is playing in Listen mode
- **THEN** the progress bar advances in real time to reflect the current playback position

### Requirement: User can seek from the mini player bar
The system SHALL allow the user to seek by interacting with the progress bar in the mini player bar, consistent with the seek behavior defined in the playback spec.

#### Scenario: User seeks via mini player progress bar
- **WHEN** the user clicks a position on the mini player progress bar while in Listen mode
- **THEN** the YouTube player seeks to the proportional position in the current video and playback continues from that point

#### Scenario: User seeks to an unbuffered position from mini player
- **WHEN** the user clicks an unbuffered position on the mini player progress bar
- **THEN** the YouTube player seeks to that position and resumes playback once enough data has loaded

### Requirement: Progress state persists across mode switches
When the user switches between Watch mode and Listen mode, the progress bar position SHALL remain consistent with the actual playback position.

#### Scenario: Switching from Watch to Listen preserves progress display
- **WHEN** the user switches to Listen mode while a video is partially played
- **THEN** the mini player progress bar immediately reflects the correct current position

#### Scenario: Switching from Listen to Watch preserves progress display
- **WHEN** the user switches back to Watch mode
- **THEN** the full player progress bar reflects the same position that was shown in the mini bar
