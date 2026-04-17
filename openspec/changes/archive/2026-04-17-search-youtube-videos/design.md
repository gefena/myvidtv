## Context

MyVidTV currently relies on users finding videos on YouTube and pasting URLs into the app. To create a seamless TV experience, we are introducing native YouTube search directly within the `AddFlow` component. We use the [Piped API](https://docs.piped.video/docs/api-documentation/) — an open-source YouTube frontend with a public REST API, no API key required, and CORS-open instances.

## Goals / Non-Goals

**Goals:**
- Allow users to search for YouTube videos by text query.
- Allow users to search for YouTube channels and view their latest videos.
- Implement a search mechanism that works without official API keys.
- Gracefully handle Piped instance downtime by falling back to other public instances.

**Non-Goals:**
- Implement complex filtering (duration, upload date) beyond basic relevance and channel searches.
- Replace the existing URL-pasting functionality (both must coexist).

## Decisions

- **Client-Side Piped API (no server route):** The client calls a public Piped instance directly via `fetch`. Piped instances have CORS open by design. No server route needed — this eliminates `ytsr`, scraping fragility, and Vercel serverless concerns entirely.

- **Instance Fallback List:** A hardcoded ordered list of reliable public instances is kept in `src/lib/youtubeSearch.ts`. On fetch failure (network error or non-2xx), the next instance is tried. Recommended primary + fallbacks:
  1. `https://pipedapi.kavin.rocks` (primary — CDN-backed, multi-region)
  2. `https://pipedapi.adminforge.de`
  3. `https://pipedapi.leptons.xyz`

- **Search Endpoint:** `GET {instance}/search?q={query}&filter=all`
  - Response: `{ relatedStreams: [{ type, url, title, thumbnail, uploaderName, uploaderUrl, duration, views, uploadedDate }] }`
  - `type` is `"stream"` for videos, `"channel"` for channels.

- **Channel Drill-Down:** When a user selects a channel result, call `GET {instance}/channel/{channelId}`. Response includes `relatedStreams` with the channel's latest videos.

- **Input Debouncing:** The omnibox input SHALL debounce user keystrokes by 350ms before triggering a search to avoid excess requests.

- **No Caching:** Results are ephemeral UI state — no persistence needed. If a user re-searches the same term, a fresh call is made (fast enough at Piped's typical latency).

## Risks / Trade-offs

- **Risk:** A single Piped instance may be down or rate-limited.
  - **Mitigation:** Fallback list of 3 instances. If all fail, display a clear error ("Search unavailable — try pasting a URL directly").

- **Risk:** Piped instances may change their CORS policy.
  - **Mitigation:** If CORS becomes an issue, a thin Next.js API route can proxy the call — one `fetch` call, trivial to add later without changing the rest of the code.

- **Risk:** Piped's API contract could change.
  - **Mitigation:** Piped's API is stable and versioned by the open-source project. Risk is lower than scraping `ytInitialData`.
