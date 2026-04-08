## ADDED Requirements

### Requirement: Loop mode toggle
The system SHALL provide a loop toggle control in the player area that cycles through three modes: `off`, `one` (repeat current item), and `all` (repeat entire queue). The active loop mode SHALL persist in `localStorage` settings and survive page reload.

#### Scenario: User cycles through loop modes
- **WHEN** the user clicks the loop toggle button
- **THEN** the mode advances: off → one → all → off, and the button visually reflects the current mode

#### Scenario: Loop mode survives page reload
- **WHEN** the user sets loop mode to `one` or `all` and reloads the page
- **THEN** the player initializes with the previously saved loop mode active

### Requirement: Loop one — single video repeat
When loop mode is `one` and the current item is a video, the system SHALL restart that video automatically when it ends, without advancing to the next item. The system SHALL NOT save the video position before restarting (saving position on `ENDED` before a loop-one restart would incorrectly reset watch progress).

#### Scenario: Video ends in loop-one mode
- **WHEN** a video finishes playing and loop mode is `one`
- **THEN** the same video restarts from the beginning automatically

#### Scenario: Loop-one does not apply to playlist-channel items
- **WHEN** a playlist-channel item is playing and loop mode is `one`
- **THEN** the player behaves as if loop mode is `off` (normal advance logic applies)

### Requirement: Loop all — queue wrap-around
When loop mode is `all`, after the last item in the current queue finishes, the system SHALL automatically begin playing the first item in the queue.

#### Scenario: Last video ends in loop-all mode
- **WHEN** the last video in the active tag queue finishes and loop mode is `all`
- **THEN** the first video in that queue begins playing automatically

#### Scenario: Loop-all mid-queue behaves like normal advance
- **WHEN** a non-last video finishes and loop mode is `all`
- **THEN** the next video plays — same as `off` mode for mid-queue items
