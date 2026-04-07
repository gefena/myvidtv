## ADDED Requirements

### Requirement: Server-side YouTube metadata proxy
The system SHALL provide a Next.js API route at `/api/youtube` that accepts a YouTube URL, calls the YouTube Data API v3 using a server-side API key, and returns normalized metadata to the client.

#### Scenario: Valid video URL fetched
- **WHEN** the client calls `/api/youtube?url=<encoded_video_url>`
- **THEN** the route returns `{ type: "video", ytId, title, channelName, thumbnail, duration, ytTags }`

#### Scenario: Valid playlist URL fetched
- **WHEN** the client calls `/api/youtube?url=<encoded_playlist_url>`
- **THEN** the route returns `{ type: "playlist", ytPlaylistId, title, channelName, thumbnail, videoCount }`

#### Scenario: Invalid or unsupported URL
- **WHEN** the client calls `/api/youtube` with a URL that is not a recognizable YouTube video or playlist
- **THEN** the route returns a 400 error with a descriptive message

#### Scenario: YouTube API key not set
- **WHEN** the `YOUTUBE_API_KEY` environment variable is missing
- **THEN** the route returns a 500 error and logs a warning server-side

### Requirement: API key is never exposed to the client
The system SHALL ensure the YouTube API key is only accessed server-side and never included in any client response or bundle.

#### Scenario: Client inspects network traffic
- **WHEN** the user inspects browser network requests
- **THEN** no request from the client contains the YouTube API key

### Requirement: Playlist items can be fetched progressively
The system SHALL support fetching individual video details from a playlist in pages of up to 50 items, returning results incrementally.

#### Scenario: Large playlist fetched
- **WHEN** the client requests video details for a playlist with more than 50 videos
- **THEN** the route returns the first 50 items and a `nextPageToken` for subsequent requests
