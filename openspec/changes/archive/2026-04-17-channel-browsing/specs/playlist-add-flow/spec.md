## MODIFIED Requirements

### Requirement: Playlist add flow is name + channel only
When a playlist URL is detected, the system SHALL prompt the user to enter a name for the playlist, then save it as a playlist-channel. No option to pick individual videos.

A URL is considered a playlist URL only when it is on `youtube.com` (not `youtu.be`), has a `list` query parameter, and has no `v` query parameter. `youtu.be` links that include a `list` parameter (e.g., `youtu.be/ID?list=PLxxx`) SHALL be treated as video links, not playlist links.

The AddFlow input SHALL be evaluated in this priority order: channel URL → playlist URL → video URL. A channel URL SHALL be detected before playlist URL detection is attempted.

#### Scenario: Playlist URL detected
- **WHEN** the user pastes a YouTube playlist URL (e.g., `youtube.com/playlist?list=PLxxx`)
- **THEN** the system parses the playlist ID from the URL and shows a name input field

#### Scenario: youtu.be URL with list param treated as video
- **WHEN** the user pastes a `youtu.be/ID?list=PLxxx` URL
- **THEN** the system treats it as a video link and fetches video metadata via oEmbed, not as a playlist

#### Scenario: youtube.com video+playlist URL treated as video
- **WHEN** the user pastes a `youtube.com/watch?v=ID&list=PLxxx` URL
- **THEN** the system treats it as a video link (v param takes precedence over list param)

#### Scenario: User names and saves the playlist
- **WHEN** the user types a name and confirms
- **THEN** the playlist is saved as a `playlist-channel` item with the user-supplied name

#### Scenario: Channel URL takes priority over playlist detection
- **WHEN** the user pastes a `youtube.com/channel/UCxxx` or `youtube.com/@handle` URL
- **THEN** the system treats it as a channel URL and does not attempt playlist detection
