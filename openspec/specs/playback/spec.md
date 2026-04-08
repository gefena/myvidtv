# playback Specification

## Purpose
Defines video and playlist-channel playback using the YouTube IFrame Player API. Covers auto-advance, watch/listen mode toggle, and basic playback controls.
## Requirements
### Requirement: YouTube IFrame Player embeds and plays content
The system SHALL embed the YouTube IFrame Player API to play videos and playlist-channels selected from the library.

#### Scenario: User selects a video to watch
- **WHEN** the user clicks a video in the library
- **THEN** the YouTube IFrame Player loads and begins playing that video

#### Scenario: User selects a playlist-channel to watch
- **WHEN** the user clicks a playlist-channel in the library
- **THEN** the YouTube IFrame Player loads the playlist and begins sequential playback

### Requirement: Auto-advance to next item
When a video finishes, the system SHALL automatically advance to the next item in the current tag view or playlist, **unless loop mode overrides this behavior**. The player SHALL load the next item without reloading or re-instantiating the IFrame Player (single-load constraint).

When loop mode is `one`, the current video SHALL restart instead of advancing.
When loop mode is `all` and the current item is the last in the queue, the first item in the queue SHALL play next.

#### Scenario: Video ends in tag view (loop off)
- **WHEN** the currently playing video ends, more videos exist in the active tag filter, and loop mode is `off`
- **THEN** the next video in the list begins playing automatically

#### Scenario: Last video ends with loop off
- **WHEN** the last video in the queue ends and loop mode is `off`
- **THEN** playback stops and no further auto-advance occurs

#### Scenario: Auto-advance does not reload the player
- **WHEN** the currently playing video ends and auto-advance triggers
- **THEN** the next video is loaded into the existing IFrame Player instance without destroying and recreating the player

#### Scenario: Video ends in loop-one mode
- **WHEN** the currently playing video ends and loop mode is `one`
- **THEN** the same video restarts from the beginning

#### Scenario: Last video ends in loop-all mode
- **WHEN** the last video in the queue ends and loop mode is `all`
- **THEN** the first video in the queue begins playing

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

#### Scenario: User seeks to an unbuffered position
- **WHEN** the user clicks a position on the progress bar that has not yet been buffered
- **THEN** the YouTube player seeks to that position and resumes playback once enough data has loaded (unbuffered seeking is permitted)

### Requirement: Playback controls are touch-accessible on mobile
On viewports ≤600px wide, the system SHALL render playback controls (play, pause, skip, listen toggle) and the progress bar with touch targets of at least 44px in the relevant dimension. The visual design of controls MAY remain unchanged; hit areas SHALL be expanded via padding or wrapper elements.

#### Scenario: Progress bar tappable on mobile
- **WHEN** the user taps the progress bar area on a small screen
- **THEN** the player seeks to the tapped position; the tap area SHALL be at least 44px tall even though the visual bar is 2px

#### Scenario: Control buttons tappable on mobile
- **WHEN** the user taps a playback control button (play, pause, skip, listen toggle) on a small screen
- **THEN** the action is reliably triggered; buttons SHALL have a minimum touch target height of 44px

