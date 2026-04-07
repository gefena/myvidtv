## ADDED Requirements

### Requirement: VideoItem does not include duration
The `VideoItem` type SHALL NOT include a `duration` field. Duration is not available from oEmbed and is not displayed in the library or now-playing bar.

#### Scenario: Video added without duration
- **WHEN** a video is saved to the library
- **THEN** the stored item has no duration field and library cards show channel name in place of duration
