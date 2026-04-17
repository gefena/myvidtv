## ADDED Requirements

### Requirement: YouTube search via Piped API
The system SHALL search for YouTube videos and channels using the [Piped API](https://docs.piped.video/docs/api-documentation/) called client-side. No API key is required. The system SHALL maintain an ordered fallback list of public Piped instances and try each in sequence on failure.

The omnibox input SHALL debounce user keystrokes by 350ms before issuing a search request. The debounce applies only to the live search trigger — explicit form submission (Enter key or submit button) SHALL bypass the debounce and act immediately.

#### Scenario: Successful search
- **WHEN** the user enters a text query that is not a recognized YouTube URL (after 350ms debounce)
- **THEN** the system calls `GET {pipedInstance}/search?q={query}&filter=all` and displays the returned results

#### Scenario: Primary instance fails, fallback used
- **WHEN** the primary Piped instance returns a network error or non-2xx response
- **THEN** the system retries with the next instance in the fallback list without surfacing an error to the user

#### Scenario: All instances fail
- **WHEN** all Piped instances in the fallback list fail
- **THEN** the system displays an error message: "Search unavailable — try pasting a URL directly"

### Requirement: Search results display in AddFlow
The `AddFlow` component SHALL display search results when the input is not a recognized URL. Results MUST include video/channel title, thumbnail, and uploader name.

#### Scenario: Displaying mixed results
- **WHEN** search results are returned from the Piped API
- **THEN** the system renders a list of cards showing thumbnails, titles, and uploader name for each result; channels are visually distinguished from videos

### Requirement: Channel drill-down for latest videos
When a user selects a "Channel" result, the system SHALL fetch the channel's latest videos via Piped's channel endpoint (`GET {pipedInstance}/channel/{channelId}`).

#### Scenario: Fetching channel videos
- **WHEN** the user clicks a channel result
- **THEN** the system extracts the channel ID from the result's `uploaderUrl` field (format: `/channel/{channelId}`), calls `GET {pipedInstance}/channel/{channelId}`, parses the `relatedStreams` array, and updates the result list with the channel's latest videos
