## ADDED Requirements

### Requirement: User can add a YouTube video to their library
The system SHALL accept a YouTube video URL, fetch its metadata, prompt the user for tags, and store the video in localStorage.

#### Scenario: Valid video URL added
- **WHEN** the user pastes a valid YouTube video URL and confirms
- **THEN** the system fetches metadata and presents a tag selection screen

#### Scenario: Video saved with tags
- **WHEN** the user selects or enters tags and clicks save
- **THEN** the video is stored in localStorage and appears in the library

#### Scenario: Duplicate video URL
- **WHEN** the user adds a URL that already exists in the library
- **THEN** the system informs the user the video is already in their library and does not duplicate it

### Requirement: User can add a YouTube playlist to their library
The system SHALL accept a YouTube playlist URL and present the user with a choice of how to add it.

#### Scenario: Playlist URL detected
- **WHEN** the user pastes a YouTube playlist URL
- **THEN** the system fetches playlist metadata and presents the playlist add flow

### Requirement: User can remove an item from their library
The system SHALL allow the user to remove any video or playlist-channel from their library.

#### Scenario: Item removed
- **WHEN** the user confirms removal of an item
- **THEN** the item is deleted from localStorage and no longer appears in the library

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
