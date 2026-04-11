## MODIFIED Requirements

### Requirement: Loop all — queue wrap-around
When loop mode is `all`, after the last item in the current queue finishes, the system SHALL automatically begin playing the first item in the queue. This applies to both video items and playlist-channel items.

#### Scenario: Last video ends in loop-all mode
- **WHEN** the last video in the active tag queue finishes and loop mode is `all`
- **THEN** the first item in that queue begins playing automatically

#### Scenario: Last playlist-channel ends in loop-all mode
- **WHEN** the last playlist-channel in the active tag queue finishes and loop mode is `all`
- **THEN** the first item in that queue begins playing automatically

#### Scenario: Loop-all mid-queue behaves like normal advance
- **WHEN** a non-last item finishes and loop mode is `all`
- **THEN** the next item plays — same as `off` mode for mid-queue items
