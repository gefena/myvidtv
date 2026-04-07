## ADDED Requirements

### Requirement: Save playback position for individual videos
The system SHALL periodically save the current playback position of any individual video being watched to the user's library.

#### Scenario: Progress is saved periodically
- **WHEN** the user is watching a video for more than 10 seconds
- **THEN** the system updates the `lastPosition` in the video item data

#### Scenario: Progress is saved on pause
- **WHEN** the user pauses the playback
- **THEN** the system immediately saves the current timestamp

### Requirement: Automatically resume from saved position
The system SHALL automatically load and seek to the saved `lastPosition` when an individual video is loaded.

#### Scenario: Video resumed on load
- **WHEN** the user clicks a video with a saved `lastPosition`
- **THEN** the YouTube player starts at that timestamp

### Requirement: 95% Completion Reset
The system SHALL reset the saved `lastPosition` to 0 if the user has watched 95% or more of the video's total duration.

#### Scenario: Finished video starts from beginning
- **WHEN** a user reaches 96% progress and pauses or moves to another video
- **THEN** the system saves `lastPosition` as 0 so it starts from the beginning next time
