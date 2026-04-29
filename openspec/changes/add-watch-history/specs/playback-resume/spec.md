## MODIFIED Requirements

### Requirement: Save playback position for individual videos
The system SHALL create or update a watch history entry when any individual video starts playback. The system SHALL periodically save the current playback position of any individual video being watched. For saved library video items, the system SHALL update the video's `lastPosition` in the user's library and SHALL also create or update the matching watch history entry. For individual videos that are not saved library items, the system SHALL save the playback position in watch history.

#### Scenario: History is recorded on playback start
- **WHEN** an individual video starts playback
- **THEN** the system creates or updates a watch history entry for the video's `ytId`
- **AND** the entry is visible in History even if playback stops before the first periodic progress save

#### Scenario: Progress is saved periodically
- **WHEN** the user is watching a video for more than 10 seconds
- **THEN** the system updates the `lastPosition` in the video item data when the video is saved in the library
- **AND** the system creates or updates the matching watch history entry

#### Scenario: Progress is saved on pause
- **WHEN** the user pauses the playback
- **THEN** the system immediately saves the current timestamp to the saved video item when present
- **AND** the system creates or updates the matching watch history entry

### Requirement: Automatically resume from saved position
The system SHALL automatically load and seek to the saved `lastPosition` when an individual video is loaded. If the loaded video has a saved library item position, the system SHALL use that position. If the loaded video does not have a saved library item position, the system SHALL use the matching watch history position when one exists.

A saved `lastPosition` of 0 SHALL be treated as an authoritative saved position, not as a missing value.

#### Scenario: Video resumed on load
- **WHEN** the user clicks a video with a saved `lastPosition`
- **THEN** the YouTube player starts at that timestamp

#### Scenario: Unsaved video resumed from history
- **WHEN** the user selects a channel or history video whose `ytId` has a watch history entry with a saved `lastPosition`
- **THEN** the YouTube player starts at the history timestamp

#### Scenario: Zero saved position does not fall back
- **WHEN** the user loads a video whose authoritative saved `lastPosition` is 0
- **THEN** the YouTube player starts from the beginning
- **AND** the system does not fall back to any other saved position for the same `ytId`

### Requirement: 95% Completion Reset
The system SHALL reset the saved `lastPosition` to 0 if the user has watched 95% or more of the video's total duration. When the video has both a saved library item and watch history entry, the reset SHALL apply to both records.

#### Scenario: Finished video starts from beginning
- **WHEN** a user reaches 96% progress and pauses or moves to another video
- **THEN** the system saves `lastPosition` as 0 so it starts from the beginning next time
- **AND** the matching watch history entry saves `lastPosition` and `lastWatchedRatio` as 0
