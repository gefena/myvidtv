## MODIFIED Requirements

### Requirement: Basic playback controls
The system SHALL expose play, pause, skip-to-next, and seek controls. For video playback, the system SHALL also expose fixed-step controls to jump backward 10 seconds and forward 10 seconds. Fixed-step seeks MUST clamp to the valid range of the current video timeline and MUST NOT change queue order or loop mode.

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

#### Scenario: User jumps backward 10 seconds
- **WHEN** the user activates the back-10 control during video playback
- **THEN** the player seeks 10 seconds earlier than the current playback time

#### Scenario: User jumps forward 10 seconds
- **WHEN** the user activates the forward-10 control during video playback
- **THEN** the player seeks 10 seconds later than the current playback time

#### Scenario: Back-10 clamps at start of video
- **WHEN** the current playback time is less than 10 seconds and the user activates the back-10 control
- **THEN** the player seeks to the beginning of the video instead of a negative timestamp

#### Scenario: Forward-10 clamps at end of video
- **WHEN** fewer than 10 seconds remain in the current video and the user activates the forward-10 control
- **THEN** the player seeks to the end of the video instead of beyond the duration

#### Scenario: Fixed-step seek controls unavailable when timeline seeking is not reliable
- **WHEN** the current playback state does not support reliable fixed-step seeking
- **THEN** the back-10 and forward-10 controls are either hidden or disabled
- **AND** they MUST NOT appear active while doing nothing

### Requirement: Playback controls are touch-accessible on mobile
On viewports ≤600px wide, the system SHALL render playback controls (play, pause, skip, 10-second back, 10-second forward, listen toggle) and the progress bar with touch targets of at least 44px in the relevant dimension. The visual design of controls MAY remain unchanged; hit areas SHALL be expanded via padding or wrapper elements.

#### Scenario: Progress bar tappable on mobile
- **WHEN** the user taps the progress bar area on a small screen
- **THEN** the player seeks to the tapped position; the tap area SHALL be at least 44px tall even though the visual bar is 2px

#### Scenario: Control buttons tappable on mobile
- **WHEN** the user taps a playback control button (play, pause, skip, 10-second back, 10-second forward, listen toggle) on a small screen
- **THEN** the action is reliably triggered; buttons SHALL have a minimum touch target height of 44px
