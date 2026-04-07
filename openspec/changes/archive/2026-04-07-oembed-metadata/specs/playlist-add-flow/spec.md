## ADDED Requirements

### Requirement: Playlist add flow is name + channel only
When a playlist URL is detected, the system SHALL prompt the user to enter a name for the playlist, then save it as a playlist-channel. No option to pick individual videos.

#### Scenario: Playlist URL detected
- **WHEN** the user pastes a YouTube playlist URL
- **THEN** the system parses the playlist ID from the URL and shows a name input field

#### Scenario: User names and saves the playlist
- **WHEN** the user types a name and confirms
- **THEN** the playlist is saved as a `playlist-channel` item with the user-supplied name and no thumbnail

## REMOVED Requirements

### Requirement: User is presented with playlist add options
**Reason**: The "Pick Videos" path requires enumerating playlist items, which needs an API key. With oEmbed only, there is no key-free way to fetch playlist items.
**Migration**: Playlists are always added as a channel. Users who want individual videos should paste each video URL separately.

### Requirement: Pick Videos checklist loads progressively
**Reason**: Removed along with the Pick Videos flow.
**Migration**: Not applicable.

### Requirement: Select All and Clear controls
**Reason**: Removed along with the Pick Videos checklist.
**Migration**: Not applicable.
