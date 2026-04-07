# library-management Specification

## Purpose
Manages the user's personal video library stored in localStorage. Covers adding videos and playlist-channels, tagging, removing items, and data persistence across sessions.

## Requirements

### Requirement: User can add a YouTube video to their library
The system SHALL accept a YouTube video URL, fetch its metadata via oEmbed, prompt the user for tags, and store the video in localStorage.

#### Scenario: Valid video URL added
- **WHEN** the user pastes a valid YouTube video URL and confirms
- **THEN** the system fetches metadata and presents a tag selection screen

#### Scenario: Video saved with tags
- **WHEN** the user selects or enters tags and clicks save
- **THEN** the video is stored in localStorage and appears in the library

#### Scenario: Duplicate video URL — already in library
- **WHEN** the user adds a URL for a video that already exists in the active library
- **THEN** the system shows an error message "This video is already in your library." and does not duplicate it

#### Scenario: Duplicate video URL — in archive
- **WHEN** the user adds a URL for a video that exists in the archive
- **THEN** the system shows an error message directing the user to restore it from the archive, and does not duplicate it

### Requirement: User can add a YouTube playlist as a channel
The system SHALL accept a YouTube playlist URL, parse the playlist ID, prompt the user to enter a name, and store it as a playlist-channel in localStorage.

#### Scenario: Playlist URL detected
- **WHEN** the user pastes a YouTube playlist URL
- **THEN** the system parses the playlist ID and shows a name input field

#### Scenario: Playlist saved with name and tags
- **WHEN** the user enters a name, optionally selects tags, and confirms
- **THEN** the playlist-channel is stored in localStorage with the user-supplied name

#### Scenario: Duplicate playlist URL — already in library
- **WHEN** the user adds a URL for a playlist that already exists in the active library
- **THEN** the system shows an error message "This playlist is already in your library." and does not duplicate it

#### Scenario: Duplicate playlist URL — in archive
- **WHEN** the user adds a URL for a playlist that exists in the archive
- **THEN** the system shows an error message directing the user to restore it from the archive, and does not duplicate it

### Requirement: User can remove an item from their library
The system SHALL allow the user to archive any video or playlist-channel from their library instead of immediate permanent deletion.

#### Scenario: Item moved to archive
- **WHEN** the user clicks the delete control on an item in the library
- **THEN** the item is moved to the archived items collection and no longer appears in the main library view

### Requirement: User can restore an item from the archive
The system SHALL allow the user to restore an archived item back to their active library.

#### Scenario: Item restored
- **WHEN** the user clicks the restore control on an archived item
- **THEN** the item is moved from the archived items collection back to the main library items collection

### Requirement: User can permanently delete an item from the archive
The system SHALL allow the user to permanently remove an archived item from localStorage.

#### Scenario: Item permanently deleted
- **WHEN** the user clicks the permanent delete control on an archived item
- **THEN** the item is removed from the archived items collection and deleted from localStorage

### Requirement: Tags can be predefined or custom
The system SHALL provide a predefined tag list (music, tech, news, comedy, documentary, sports, education, art, gaming, cooking, fitness, talk) and allow users to enter custom tags.

#### Scenario: User selects predefined tag
- **WHEN** the user clicks a predefined tag during the add flow
- **THEN** the tag is toggled on the item being added

#### Scenario: User enters a custom tag
- **WHEN** the user types a tag name and confirms
- **THEN** the custom tag is added to the item and saved to the custom tags list for future use

### Requirement: Library data persists across sessions
The system SHALL store all library data in localStorage so it survives page reloads and browser restarts.

#### Scenario: Page reloaded with existing library
- **WHEN** the user reloads the page
- **THEN** all previously added videos and playlist-channels are present in the library

### Requirement: VideoItem does not include duration
The `VideoItem` type SHALL NOT include a `duration` field. Duration is not available from oEmbed and is not displayed in the library or now-playing bar.

#### Scenario: Video added without duration
- **WHEN** a video is saved to the library
- **THEN** the stored item has no duration field and library cards show channel name in place of duration
