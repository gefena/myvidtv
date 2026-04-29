## Purpose
Defines the local watch history capability for recording, retaining, displaying, replaying, and removing recently watched individual YouTube videos independent of library membership.

## Requirements

### Requirement: Watched videos are recorded in history
The system SHALL record a watch history entry when an individual YouTube video starts playback, regardless of whether the video is saved in the library, selected from a saved channel, or selected from the history view.

Each watch history entry SHALL be keyed by `ytId` and store the video title, channel name, thumbnail, last saved playback position, last watched ratio, first watched timestamp, and last watched timestamp.

#### Scenario: Library video starts playback
- **WHEN** the user starts playback of a saved video item
- **THEN** the system creates or updates a watch history entry for that video's `ytId`

#### Scenario: Channel video starts playback
- **WHEN** the user starts playback of a video selected from a channel browse modal
- **THEN** the system creates or updates a watch history entry for that video's `ytId`

#### Scenario: Existing history item is watched again
- **WHEN** the user starts playback of a video whose `ytId` already exists in watch history
- **THEN** the system updates the existing entry's metadata, source context, and `lastWatchedAt` timestamp without creating a duplicate row
- **AND** the system preserves the existing playback position and watched ratio until newer progress is saved

### Requirement: Watch history is bounded
The system SHALL retain only recent watch history entries to keep local storage bounded. After each history write or import, the system SHALL remove entries older than 180 days and SHALL keep at most the 50 entries with the newest `lastWatchedAt` timestamp.

#### Scenario: History exceeds item limit
- **WHEN** watch history contains more than 50 entries after a new entry is saved
- **THEN** the system keeps the 50 most recently watched entries and removes older entries

#### Scenario: History contains expired entries
- **WHEN** watch history contains entries whose `lastWatchedAt` is more than 180 days old
- **THEN** the system removes those expired entries

### Requirement: User can browse watch history
The system SHALL provide a History view that lists watch history entries in descending `lastWatchedAt` order. Each history row SHALL display the video thumbnail, title, channel name, and a progress indicator when `lastWatchedRatio` is greater than 0.

History rows SHALL NOT be treated as saved library items and SHALL NOT display tag editing, archive, restore, or permanent-delete controls.

History rows SHALL remain usable on desktop and mobile viewports. On small screens, each row SHALL keep stable thumbnail dimensions, render long titles across up to two readable lines before truncating, keep channel metadata visible beneath the title, and remain a single tap target for playback.

#### Scenario: User opens History view
- **WHEN** the user opens the History view
- **THEN** the system displays watched videos ordered by most recently watched first

#### Scenario: History row has partial progress
- **WHEN** a history entry has `lastWatchedRatio` greater than 0
- **THEN** the row displays a thin progress bar proportional to `lastWatchedRatio`

#### Scenario: History is empty
- **WHEN** the user opens History view and no watch history entries exist
- **THEN** the system displays an empty History state instead of library items

#### Scenario: Mobile history row remains readable
- **WHEN** the user views History on a small screen and a history entry has a long title
- **THEN** the title visibly renders across up to two lines before truncating
- **AND** the channel metadata remains visible beneath the title

#### Scenario: Mobile history row remains a single tap target
- **WHEN** the user taps anywhere on the main content of a history row on a small screen
- **THEN** the system selects that history entry for playback

### Requirement: User can replay history entries
The system SHALL allow the user to select a watch history entry for playback. Selecting a history entry SHALL play that video as an individual transient video and SHALL NOT add it to the library.

#### Scenario: History entry selected
- **WHEN** the user selects a video from the History view
- **THEN** the video begins playing from its saved history position
- **AND** the video is not added to the user's library

#### Scenario: History entry with channel source selected
- **WHEN** the user selects a history entry whose most recent source is a saved channel with a `channelId`
- **THEN** the video begins playing from its saved history position
- **AND** the system restores channel playback context for that source channel

#### Scenario: History entry with zero saved position selected
- **WHEN** the user selects a history entry whose `lastPosition` is 0
- **THEN** the video starts from the beginning
- **AND** the system does not fall back to any older saved position

### Requirement: User can remove history entries
The system SHALL allow the user to remove an individual watch history entry without deleting any saved library item with the same `ytId`. The remove action SHALL be available on both desktop and mobile. On mobile, the remove action SHALL be visible without hover and SHALL have a touch-accessible target size.

#### Scenario: User removes a history entry
- **WHEN** the user removes a video from the History view
- **THEN** the watch history entry is deleted
- **AND** any saved library video with the same `ytId` remains in the library

#### Scenario: Remove history action visible on mobile
- **WHEN** the user views History on a small screen
- **THEN** each history row's remove action is visible without requiring hover
