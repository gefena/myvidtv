## MODIFIED Requirements

### Requirement: Auto-advance to next item
When a video finishes, the system SHALL automatically advance to the next item in the current tag view or playlist. The transition SHALL load the next video exactly once — the player SHALL NOT reload or restart the video as a side effect of parent state synchronization.

#### Scenario: Video ends in tag view
- **WHEN** the currently playing video ends and more videos exist in the active tag filter
- **THEN** the next video in the list begins playing automatically

#### Scenario: Auto-advance does not double-load
- **WHEN** the player auto-advances to the next video
- **THEN** `loadVideoById` is called exactly once for that video — not a second time due to prop synchronization

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
- **THEN** the YouTube player seeks to the proportional position in the current video, including portions not yet buffered
