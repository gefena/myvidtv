## Why

Currently, adding content to MyVidTV requires users to leave the application, search for videos on YouTube, copy the URL, and paste it into the AddFlow. This breaks the seamless "TV" experience. Integrating native YouTube search directly into the app will transform it from a passive link aggregator into an active discovery hub, allowing users to find and add content (both generic searches and latest channel videos) without breaking context.

## What Changes

- Transform the existing `AddFlow` URL input into an "Omnibox" that accepts both URLs and search queries.
- Call the [Piped API](https://docs.piped.video/docs/api-documentation/) directly from the client for search — no API key required, CORS-open public instances.
- Maintain a short list of fallback Piped instances; try each in order on failure.
- Display search results (videos and channels) directly within the `AddFlow` modal.
- Support channel drill-down: selecting a channel result fetches its latest videos via Piped's `/channel/:id` endpoint.

## Capabilities

### New Capabilities
- `youtube-search`: The ability to search for YouTube videos and channels directly within the application.

### Modified Capabilities
- `playlist-add-flow`: The requirement is changing from strictly accepting URLs to accepting both URLs and text queries, and displaying search results.

## Impact

- **UI/UX:** `AddFlow` component will become more complex, handling search states, result rendering, and channel drill-downs.
- **Backend/API:** No new server-side routes required — Piped is called client-side.
- **Dependencies:** No new npm packages. Piped is a REST API called via `fetch`.
- **Infrastructure:** No caching or rate limiting concerns on our side; Piped instances handle their own load.
