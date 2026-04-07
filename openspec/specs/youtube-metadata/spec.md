# youtube-metadata Specification

## Purpose
Defines how YouTube video metadata is fetched. Uses the YouTube oEmbed endpoint — no API key required, called directly from the client.

## Requirements

### Requirement: Client-side YouTube metadata fetch via oEmbed
The system SHALL fetch video metadata by calling the YouTube oEmbed endpoint directly from the client — no server route, no API key required.

#### Scenario: Valid video URL fetched
- **WHEN** the user submits a valid YouTube video URL
- **THEN** the client calls `https://www.youtube.com/oembed?url=<encoded>&format=json` and receives title, thumbnail_url, and author_name

#### Scenario: Invalid or unsupported URL
- **WHEN** the user submits a URL that is not a valid YouTube video URL
- **THEN** the oEmbed call fails and the UI shows a clear error message

### Requirement: Playlist URL parsed client-side without a network call
The system SHALL extract the playlist ID from a YouTube playlist URL using URL parsing only — no network request needed.

#### Scenario: Playlist URL parsed
- **WHEN** the user submits a YouTube playlist URL
- **THEN** the playlist ID is extracted from the URL query parameters and the user is prompted to name the playlist
