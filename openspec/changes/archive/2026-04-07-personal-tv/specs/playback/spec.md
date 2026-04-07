## ADDED Requirements

### Requirement: YouTube IFrame Player embeds and plays content
The system SHALL embed the YouTube IFrame Player API to play videos and playlist-channels selected from the library.

#### Scenario: User selects a video to watch
- **WHEN** the user clicks a video in the library
- **THEN** the YouTube IFrame Player loads and begins playing that video

#### Scenario: User selects a playlist-channel to watch
- **WHEN** the user clicks a playlist-channel in the library
- **THEN** the YouTube IFrame Player loads the playlist and begins sequential playback

### Requirement: Auto-advance to next item
When a video finishes, the system SHALL automatically advance to the next item in the current tag view or playlist.

#### Scenario: Video ends in tag view
- **WHEN** the currently playing video ends and more videos exist in the active tag filter
- **THEN** the next video in the list begins playing automatically

### Requirement: Watch / Listen toggle
The system SHALL provide a toggle that switches between Watch mode (full video player visible) and Listen mode (player hidden, audio continues, mini bar shown at bottom).

#### Scenario: User switches to Listen mode
- **WHEN** the user activates the Listen toggle
- **THEN** the video player is hidden via CSS (not removed from DOM) and a mini player bar appears at the bottom of the screen with title and playback controls

#### Scenario: User switches back to Watch mode
- **WHEN** the user activates the Watch toggle
- **THEN** the full video player is shown again and the mini bar is hidden

#### Scenario: Listen mode preserves playback position
- **WHEN** the user switches to Listen mode while a video is playing
- **THEN** audio continues uninterrupted from the same position

### Requirement: Basic playback controls
The system SHALL expose play, pause, and skip-to-next controls.

#### Scenario: User pauses playback
- **WHEN** the user clicks the pause control
- **THEN** the YouTube player pauses

#### Scenario: User skips to next
- **WHEN** the user clicks the skip control
- **THEN** the next item in the queue begins playing
