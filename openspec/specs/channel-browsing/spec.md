# channel-browsing Specification

## Purpose
Defines the capability to save YouTube channels to the library and browse their recent videos via a modal overlay.

## Requirements

### Requirement: Save a YouTube channel to the library
The system SHALL accept YouTube channel URLs in the AddFlow input and save them as `channel` library items. Supported URL formats are `youtube.com/channel/{channelId}` and `youtube.com/@{handle}`. For `@handle` URLs, the system SHALL resolve the handle to a stable channel ID by fetching the YouTube page and parsing the RSS `<link>` tag from `<head>`.

The system SHALL pre-fill the channel name from the RSS feed's `<title>` and present a confirmation step where the user may edit the name before saving.

#### Scenario: Channel URL with direct ID detected
- **WHEN** the user pastes a `youtube.com/channel/UCxxx` URL
- **THEN** the system identifies it as a channel URL and proceeds to the channel-name confirmation step with the name pre-filled from the RSS feed

#### Scenario: @handle URL resolved to channel ID
- **WHEN** the user pastes a `youtube.com/@handle` URL
- **THEN** the system fetches the YouTube page, parses the channel ID from the RSS link tag in `<head>`, and proceeds to the channel-name confirmation step

#### Scenario: @handle resolution fails
- **WHEN** the system cannot parse a channel ID from the fetched page
- **THEN** the system displays an error: "Could not resolve channel. Try using a youtube.com/channel/UCxxx URL instead."

#### Scenario: User confirms and saves the channel
- **WHEN** the user confirms the channel name (edited or as pre-filled)
- **THEN** the system saves a `channel` item with the resolved channel ID, name, and selected tags

#### Scenario: Channel already in library
- **WHEN** the user tries to add a channel that already exists in the library or archive
- **THEN** the system displays an appropriate duplicate error and does not save

### Requirement: Channel cards in the library
Channel items saved to the library SHALL be displayed as cards visually consistent with other library items. Each channel card SHALL carry a visible "Channel" badge to distinguish it from video and playlist-channel cards.

#### Scenario: Channel card rendered in library
- **WHEN** the library contains a `channel` item
- **THEN** a card is rendered showing the channel name, thumbnail (if available), tags, and a "Channel" badge

### Requirement: Channel browse modal
Clicking a channel card SHALL open a modal overlay that fetches and displays the channel's most recent videos via YouTube's public RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`). The modal SHALL show video title, thumbnail, and published date for each entry. The RSS feed provides approximately 15 most recent videos.

#### Scenario: Browse modal opens and loads videos
- **WHEN** the user clicks a channel card
- **THEN** the channel browse modal opens and fetches the RSS feed, displaying the list of recent videos

#### Scenario: Video selected for playback
- **WHEN** the user clicks a video in the channel browse modal
- **THEN** the video begins playing in the player and the modal closes; the video is NOT added to the library

#### Scenario: RSS fetch fails
- **WHEN** the RSS feed cannot be fetched
- **THEN** the modal displays an error message and offers a retry option
