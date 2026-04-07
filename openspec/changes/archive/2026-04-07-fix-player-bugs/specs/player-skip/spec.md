## ADDED Requirements

### Requirement: Skip-next advances through the app queue for all item types
The system SHALL advance to the next item in the current queue when skip is triggered, regardless of item type. For video items this means finding the next entry in `queueRef.current`; for playlist-channels the YT player's internal `nextVideo()` may be called instead.

#### Scenario: Skip on a video item advances to next video
- **WHEN** the user clicks skip while a video item is playing
- **THEN** the next video item in the queue begins playing

#### Scenario: Skip on last item does nothing
- **WHEN** the user clicks skip on the last item in the queue
- **THEN** playback stops and no new item is loaded

#### Scenario: Skip behaves identically to auto-advance on end
- **WHEN** the user skips a video item
- **THEN** the same state transitions occur as when a video item reaches its natural end and auto-advances
