## ADDED Requirements

### Requirement: Client-side YouTube metadata fetch via oEmbed
The system SHALL fetch video metadata by calling the YouTube oEmbed endpoint directly from the client — no server route, no API key required.

#### Scenario: Valid video URL fetched
- **WHEN** the user submits a valid YouTube video URL
- **THEN** the client calls `https://www.youtube.com/oembed?url=<encoded>&format=json` and receives title, thumbnail_url, and author_name

#### Scenario: Invalid or unsupported URL
- **WHEN** the user submits a URL that is not a valid YouTube video URL
- **THEN** the oEmbed call fails and the UI shows a clear error message

## REMOVED Requirements

### Requirement: Server-side YouTube metadata proxy
**Reason**: No API key is needed with oEmbed, so there is nothing to hide server-side. The `/api/youtube` route and all YouTube Data API v3 calls are removed.
**Migration**: Metadata is now fetched client-side via `src/lib/oembed.ts`.

### Requirement: API key is never exposed to the client
**Reason**: No API key exists. oEmbed requires no authentication.
**Migration**: No action needed — there is no key to protect.

### Requirement: Playlist items can be fetched progressively
**Reason**: oEmbed has no playlist items endpoint. The Pick Videos flow is removed.
**Migration**: Users add individual video URLs, or add playlists as a channel with a user-supplied name.
