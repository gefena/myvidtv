# channel-browsing Specification

## Purpose
Defines the capability to save YouTube channels to the library and browse their recent videos via a modal overlay.
## Requirements
### Requirement: Save a YouTube channel to the library
The system SHALL accept YouTube channel URLs in the AddFlow input and save them as `channel` library items. Supported URL formats are `youtube.com/channel/{channelId}`, `youtube.com/@{handle}`, `youtube.com/c/{name}`, and `youtube.com/user/{name}`. For `@handle`, `/c/`, and `/user/` URLs, the system SHALL resolve the identifier to a stable channel ID by fetching the YouTube page server-side and parsing the channel ID from the RSS `<link>` tag in `<head>`.

The system SHALL pre-fill the channel name from the RSS feed's `<title>` and present a confirmation step where the user may edit the name before saving. The system SHALL capture the first video thumbnail from the RSS feed and store it as the channel's thumbnail.

When channel resolution or RSS prefill fails, the AddFlow SHALL preserve the existing friendly user-facing error messages. If the API provides a diagnostic request ID, the AddFlow SHALL display it as a reference for troubleshooting without exposing raw upstream response details.

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
- **AND** the system displays the diagnostic request ID when the API provides one

#### Scenario: Channel ID could not be parsed from page
- **WHEN** the server fetches the YouTube page successfully but cannot find the RSS channel ID in the HTML
- **THEN** the system displays: "Could not read channel ID from this URL. Try using youtube.com/channel/UCxxx directly."
- **AND** the system displays the diagnostic request ID when the API provides one

#### Scenario: Network failure during resolution
- **WHEN** the server cannot reach YouTube
- **THEN** the system displays: "Could not reach YouTube. Check your connection and try again."
- **AND** the system displays the diagnostic request ID when the API provides one

#### Scenario: Channel RSS prefill fails
- **WHEN** the server resolves a channel ID but cannot fetch or parse the channel RSS feed for prefill
- **THEN** the system displays the existing channel feed error
- **AND** the system displays the diagnostic request ID when the API provides one
- **AND** the system does not display raw upstream response details

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

### Requirement: Channel browse modal
Clicking a channel card SHALL open a modal overlay that fetches and displays the channel's most recent videos via YouTube's public RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`). The modal SHALL show video title, thumbnail, and published date for each entry. The RSS feed provides approximately 15 most recent videos. The modal SHALL always open from the top of the list (no scroll state is preserved between openings). The modal MAY be triggered from sources other than a channel card click (e.g. a back-to-channel affordance in the player) — it SHALL behave identically regardless of trigger.

When a fetched channel video has a matching watch history entry with `lastWatchedRatio` greater than 0, the modal row SHALL display a thin progress indicator for that video. Selecting a channel video SHALL use watch history to resume playback when a matching entry exists, and playback SHALL create or update watch history without adding the video to the library.

When the RSS fetch fails and a valid cache entry exists, the modal SHALL display the cached videos with a staleness banner indicating the cache date. When the RSS fetch fails and no valid cache entry exists, the modal SHALL display a context-specific error message based on the failure type and offer a retry option. If the channel feed API provides a diagnostic request ID, the modal SHALL display it as a reference for troubleshooting without exposing raw upstream response details.

On small screens, the scrolling video list in the channel browse modal SHALL render each video title across up to two readable lines before truncating instead of forcing a single-line ellipsis. The published date SHALL remain visible as separate metadata beneath the title, and the row SHALL remain a single tap target for playback.

#### Scenario: Browse modal opens and loads videos
- **WHEN** the user clicks a channel card
- **THEN** the channel browse modal opens and fetches the RSS feed, displaying the list of recent videos from the top

#### Scenario: Browse modal reopened from player back-to-channel affordance
- **WHEN** the user activates the back-to-channel control while a channel video is playing
- **THEN** the channel browse modal opens for the source channel, fetching fresh data from the top of the list

#### Scenario: Video selected for playback
- **WHEN** the user clicks a video in the channel browse modal
- **THEN** the video begins playing in the player and the modal closes; the video is NOT added to the library

#### Scenario: Channel row shows history progress
- **WHEN** a channel browse video has a matching watch history entry with `lastWatchedRatio` greater than 0
- **THEN** the modal row displays a thin progress indicator proportional to `lastWatchedRatio`

#### Scenario: Channel video resumes from history
- **WHEN** the user selects a channel browse video with a matching watch history entry that has `lastPosition` greater than 0
- **THEN** playback starts from the saved history position

#### Scenario: Channel video updates history
- **WHEN** the user starts playback of a video selected from the channel browse modal
- **THEN** the system creates or updates the matching watch history entry without adding the video to the library

#### Scenario: Channel video records source context
- **WHEN** the user starts playback of a video selected from the channel browse modal
- **THEN** the matching watch history entry records the source channel context

#### Scenario: RSS fetch fails — stale cache available
- **WHEN** the RSS feed fetch fails AND a valid cache entry exists for the channel (within 7 days)
- **THEN** the modal displays the cached video list with a banner reading "Showing cached videos from [date] — YouTube could not be reached."
- **AND** the modal does not display an error state or retry button

#### Scenario: RSS fetch fails — YouTube server error, no cache
- **WHEN** the RSS feed fetch fails with a YouTube server error (`YOUTUBE_RSS_UPSTREAM_ERROR`) AND no valid cache entry exists
- **THEN** the modal displays the message "YouTube's feed server is currently unavailable." and offers a retry option
- **AND** the modal displays the diagnostic request ID when the API provides one

#### Scenario: RSS fetch fails — network error, no cache
- **WHEN** the RSS feed fetch fails with a network or timeout error (`YOUTUBE_RSS_FETCH_ERROR`) AND no valid cache entry exists
- **THEN** the modal displays the message "Could not reach YouTube. Check your connection." and offers a retry option
- **AND** the modal displays the diagnostic request ID when the API provides one

#### Scenario: RSS fetch fails — parse error, no cache
- **WHEN** the RSS feed fetch fails with a parse error (`YOUTUBE_RSS_PARSE_ERROR`) AND no valid cache entry exists
- **THEN** the modal displays the message "Unexpected response from YouTube's feed server." and offers a retry option
- **AND** the modal displays the diagnostic request ID when the API provides one

#### Scenario: Mobile channel list shows more readable titles
- **WHEN** the user browses a channel on a small screen and a video has a long title
- **THEN** the title visibly renders across up to two lines before truncating instead of being forced to a single line
- **AND** the published date remains visible beneath the title

#### Scenario: Mobile channel row remains a single tap target
- **WHEN** the user taps anywhere on a video row in the mobile channel browse list
- **THEN** the system selects that video for playback using the same row-level interaction as before

