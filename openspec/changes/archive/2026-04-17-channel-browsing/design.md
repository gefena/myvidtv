## Context

MyVidTV's library currently holds two item types: `video` and `playlist-channel`. Users add content by pasting URLs one at a time. There is no way to save a YouTube channel as a destination to revisit. This design introduces a `channel` item type backed by YouTube's public RSS feed, requiring no API key.

## Goals / Non-Goals

**Goals:**
- Support pasting any YouTube channel URL format into AddFlow.
- Resolve `@handle` URLs to a stable channel ID without scraping dynamic content.
- Fetch and display ~15 most recent videos from a saved channel on demand.
- Play a video from the browse view without adding it to the library.
- Keep the implementation dependency-free (no new npm packages).

**Non-Goals:**
- Polling or background refresh of channel feeds.
- Pagination beyond the RSS feed's default ~15 videos.
- Adding a video from the browse view to the library (play-only for now).
- Supporting non-YouTube channels.

## Decisions

- **`channel` as a new library item type (not reusing `playlist-channel`):** `playlist-channel` carries a `ytPlaylistId` and is conceptually static — a named playlist. A channel is live content identified by a `channelId`. Merging them would complicate the data model and the UI. A separate type is cleaner.

- **RSS feed for video list:** `https://www.youtube.com/feeds/videos.xml?channel_id=UCxxx` returns ~15 recent videos with title, video ID, thumbnail, and published date. No API key, no rate limit documented, stable for years. This is the primary data source for the browse view.

- **`@handle` resolution via server-side API route:** YouTube's `youtube.com/@handle` HTML includes a `<link rel="alternate" type="application/rss+xml">` tag in the `<head>` whose `href` contains the channel ID (`?channel_id=UCxxx`). Fetching this page must happen server-side (`/api/resolve-channel?handle=`) because `youtube.com` blocks cross-origin browser requests. The Next.js API route fetches the page, parses the channel ID with a regex, and returns it as JSON. No JS execution needed — this tag is server-rendered and stable.

- **`DOMParser` for RSS parsing:** The browser-native `DOMParser` can parse XML without any library. This keeps the bundle unchanged.

- **Channel name pre-filled, user can edit:** When a channel URL is detected, the system fetches the channel name from the RSS feed's `<title>` tag and pre-fills the name input. The user confirms (or edits) before saving — same pattern as the playlist flow.

- **Browse modal, not a page:** A modal overlay keeps implementation simple, avoids routing changes, and is consistent with the existing AddFlow pattern. The modal fetches the RSS feed on open.

- **Play-only from browse view:** Clicking a video calls the existing player without saving to library. This fits the "TV channel" metaphor — you tune in, you watch, you don't curate every video. Users can always paste the video URL separately if they want to save it.

- **`channelId` stored (not `@handle`):** The channel ID (`UCxxx`) is the stable identifier used for RSS. Storing the handle would require re-resolving on every open. Channel IDs don't change.

## Risks / Trade-offs

- **Risk:** The `@handle` → channel ID page fetch may break if YouTube changes its `<head>` structure.
  - **Mitigation:** The RSS `<link>` tag is a standard HTML metadata convention that has been stable for a long time. If it breaks, the fallback is to require users to paste `channel/UCxxx` URLs directly (which always work).

- **Risk:** YouTube's RSS feed returns only ~15 videos; power users may find this limiting.
  - **Mitigation:** Accepted for v1. Pagination or a "load more" path via Piped/Invidious can be added later when a reliable backend is available.

- **Risk:** The RSS fetch is a cross-origin request from the browser.
  - **Mitigation:** YouTube's RSS feed has CORS headers that allow browser fetches. Verified at `https://www.youtube.com/feeds/videos.xml`.
