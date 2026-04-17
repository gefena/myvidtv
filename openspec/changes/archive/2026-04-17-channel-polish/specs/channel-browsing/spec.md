## MODIFIED Requirements

### Requirement: Save a YouTube channel to the library
The system SHALL accept YouTube channel URLs in the AddFlow input and save them as `channel` library items. Supported URL formats are `youtube.com/channel/{channelId}`, `youtube.com/@{handle}`, `youtube.com/c/{name}`, and `youtube.com/user/{name}`. For `@handle`, `/c/`, and `/user/` URLs, the system SHALL resolve the identifier to a stable channel ID by fetching the YouTube page server-side and parsing the channel ID from the RSS `<link>` tag in `<head>`.

The system SHALL pre-fill the channel name from the RSS feed's `<title>` and present a confirmation step where the user may edit the name before saving. The system SHALL capture the first video thumbnail from the RSS feed and store it as the channel's thumbnail.

#### Scenario: Channel URL with direct ID detected
- **WHEN** the user pastes a `youtube.com/channel/UCxxx` URL
- **THEN** the system identifies it as a channel URL and proceeds to the channel-name confirmation step with the name pre-filled from the RSS feed

#### Scenario: @handle URL resolved to channel ID
- **WHEN** the user pastes a `youtube.com/@handle` URL
- **THEN** the system fetches the YouTube page server-side, parses the channel ID from the RSS link tag in `<head>`, and proceeds to the channel-name confirmation step

#### Scenario: Legacy /c/ URL resolved to channel ID
- **WHEN** the user pastes a `youtube.com/c/<name>` URL
- **THEN** the system routes it through the server-side resolver, obtains the channel ID, and proceeds to the channel-name confirmation step

#### Scenario: Legacy /user/ URL resolved to channel ID
- **WHEN** the user pastes a `youtube.com/user/<name>` URL
- **THEN** the system routes it through the server-side resolver, obtains the channel ID, and proceeds to the channel-name confirmation step

#### Scenario: Channel not found
- **WHEN** the server fetches the YouTube page and receives a 404
- **THEN** the system displays: "Channel not found. Check the URL and try again."

#### Scenario: Channel ID could not be parsed from page
- **WHEN** the server fetches the YouTube page successfully but cannot find the RSS channel ID in the HTML
- **THEN** the system displays: "Could not read channel ID from this URL. Try using youtube.com/channel/UCxxx directly."

#### Scenario: Network failure during resolution
- **WHEN** the server cannot reach YouTube
- **THEN** the system displays: "Could not reach YouTube. Check your connection and try again."

#### Scenario: User confirms and saves the channel
- **WHEN** the user confirms the channel name (edited or as pre-filled)
- **THEN** the system saves a `channel` item with the resolved channel ID, name, thumbnail, and selected tags

#### Scenario: Channel already in library
- **WHEN** the user tries to add a channel that already exists in the library or archive
- **THEN** the system displays an appropriate duplicate error and does not save

### Requirement: Channel cards in the library
Channel items saved to the library SHALL be displayed as cards visually consistent with other library items. Each channel card SHALL carry a visible "Channel" badge to distinguish it from video and playlist-channel cards. The card SHALL display the channel thumbnail captured at save-time.

#### Scenario: Channel card rendered with thumbnail
- **WHEN** the library contains a `channel` item with a non-empty thumbnail
- **THEN** a card is rendered showing the thumbnail image, channel name, tags, and a "Channel" badge

#### Scenario: Channel card rendered without thumbnail
- **WHEN** the library contains a `channel` item with an empty thumbnail
- **THEN** a card is rendered with a placeholder background, channel name, tags, and a "Channel" badge
