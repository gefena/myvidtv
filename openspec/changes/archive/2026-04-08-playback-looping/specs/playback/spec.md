## MODIFIED Requirements

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
