## MODIFIED Requirements

### Requirement: Loop all — queue wrap-around
When loop mode is `all`, after the last item in the current queue finishes, the system SHALL automatically begin playing the first item in the queue. This applies to both video items and playlist-channel items.

Loop-all wrap-around SHALL only apply to items that are present in the active queue. Items not in the queue (e.g., transient channel-browse videos) SHALL be treated as if loop mode is `off` — no auto-advance, no wrap-around.

#### Scenario: Last video ends in loop-all mode
- **WHEN** the last video in the active tag queue finishes and loop mode is `all`
- **THEN** the first item in that queue begins playing automatically

#### Scenario: Last playlist-channel ends in loop-all mode
- **WHEN** the last playlist-channel in the active tag queue finishes and loop mode is `all`
- **THEN** the first item in that queue begins playing automatically

#### Scenario: Loop-all mid-queue behaves like normal advance
- **WHEN** a non-last item finishes and loop mode is `all`
- **THEN** the next item plays — same as `off` mode for mid-queue items

#### Scenario: Loop-all does not advance from a channel-browse video
- **WHEN** a channel-browse video (not in the library queue) finishes and loop mode is `all`
- **THEN** no auto-advance occurs and the channel-browse ended state is shown normally

#### Scenario: Skip does nothing on a channel-browse video in loop-all mode
- **WHEN** a channel-browse video is playing and the user clicks skip and loop mode is `all`
- **THEN** playback does not advance to a library item

## ADDED Requirements

### Requirement: Player loop mode reflects imported settings after Replace import
When the user performs a Replace import, the player's active loop mode SHALL reflect the `loopMode` value from the imported settings without requiring a page refresh.

#### Scenario: Replace import with different loop mode
- **WHEN** the user performs a Replace import with a library whose settings include a different `loopMode` than the current session
- **THEN** the loop toggle button in the player bar updates to reflect the imported loop mode

### Requirement: Player listen mode reflects imported settings after Replace import
When the user performs a Replace import, the player's active listen/watch mode SHALL reflect the `listenMode` value from the imported settings without requiring a page refresh.

#### Scenario: Replace import with listen mode enabled
- **WHEN** the user performs a Replace import with a library whose settings have `listenMode: true` while the current session is in watch mode
- **THEN** the player switches to listen mode automatically
