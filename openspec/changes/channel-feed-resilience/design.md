## Context

The app fetches YouTube RSS feeds live on every channel modal open via `/api/channel-feed`. YouTube's `feeds/videos.xml` endpoint has no SLA and has experienced outages lasting up to ~10 hours, recurring across 2021–2026 with no official fix. The error message currently shown ("Check your connection") misdiagnoses a YouTube server problem as a local network issue. There is no fallback — any outage makes channels completely dark.

The app has no backend storage: all persistence is in browser `localStorage`. Vercel serverless functions are stateless and cold-start frequently (overnight idle = guaranteed cold start), so any server-side in-memory cache would be empty exactly when the morning outage hits.

## Goals / Non-Goals

**Goals:**
- Channels remain usable during YouTube RSS outages up to 7 days after last successful fetch
- Error messages accurately describe what failed (YouTube server vs. network vs. parse)
- Cache stays within modest localStorage budget with automatic eviction
- Cache refreshes transparently on every successful fetch — no manual action needed

**Non-Goals:**
- Server-side persistent cache (requires external storage, out of scope for this app)
- Pre-warming the cache (only caches what the user has actually browsed)
- Caching resolve-channel results (that's a one-time add-flow operation, not recurring)
- Offline support beyond cached channel feeds

## Decisions

### Decision 1: Client-side localStorage cache, not server-side

**Chosen:** Store parsed `ChannelFeed` objects in `localStorage` keyed by `channelId`.

**Alternatives considered:**
- *Next.js `fetch` cache with `revalidate`*: Doesn't survive Vercel cold starts. Would be empty every morning — exactly the wrong behavior.
- *In-memory server Map*: Same cold-start problem. Warm only during active sessions.
- *Vercel KV / Redis*: Adds a paid external dependency to a zero-infra personal app.

**Rationale:** `localStorage` is the only persistence layer available without adding infrastructure. It survives overnight browser sessions and Vercel cold starts. It's consistent with the app's existing "no backend storage" contract.

### Decision 2: Stale-on-error serving, not fixed TTL

**Chosen:** Always attempt a fresh fetch first. On success, update cache. On error, serve stale data regardless of age (up to 7 days), with a visible staleness banner.

**Alternatives considered:**
- *Fixed TTL (e.g. 30 min) with hard expiry*: A 10-hour outage would blow past a 30-min TTL. Even a 12-hour TTL would cause stale data to be shown during normal use, not just during outages.

**Rationale:** The user always gets the freshest data when YouTube is healthy. Stale data only surfaces when YouTube is actually broken. The 7-day limit discards entries that are so old they're more misleading than helpful.

### Decision 3: LRU cap of 30 channels

**Chosen:** Keep at most 30 cache entries. On insert when at capacity, evict the entry with the oldest `lastAccessedAt`.

**Rationale:** 30 channels × ~15 videos × ~500 bytes per entry ≈ 225 KB — well within typical localStorage limits (~5 MB). A personal library is unlikely to exceed 30 channels in practice, so eviction will rarely trigger.

### Decision 4: Cache key and localStorage structure

```ts
// localStorage key: "myvidtv_channel_feed_cache"
type FeedCacheEntry = {
  feed: ChannelFeed;       // parsed feed (channelName, channelThumbnail, videos[])
  cachedAt: number;        // unix ms — when it was fetched
  lastAccessedAt: number;  // unix ms — for LRU eviction
};
type FeedCacheStore = Record<string, FeedCacheEntry>; // keyed by channelId
```

Stored separately from `myvidtv_library` so cache corruption cannot affect library data.

### Decision 4b: `fetchChannelFeed` return type

**Chosen:** Wrapper type — `Promise<{ feed: ChannelFeed; fromCache: boolean }>` always.

**Alternatives considered:**
- *`ChannelFeed & { fromCache?: boolean }`*: Simpler, but it pollutes the domain type with a transport concern, and the optional flag means callers must handle `undefined`.

**Rationale:** The wrapper keeps `ChannelFeed` clean and makes `fromCache` an explicit, always-present boolean. The call site in `ChannelBrowseModal` changes from `const feed = await fetchChannelFeed(...)` to `const { feed, fromCache } = await fetchChannelFeed(...)` — a one-line update.

### Decision 5: Error message differentiation

Map API error codes to specific messages in `ChannelBrowseModal`:

| `code` / condition | Message |
|---|---|
| `YOUTUBE_RSS_UPSTREAM_ERROR` (4xx/5xx) | "YouTube's feed server is currently unavailable." |
| `YOUTUBE_RSS_FETCH_ERROR` (network/timeout) | "Could not reach YouTube. Check your connection." |
| `YOUTUBE_RSS_PARSE_ERROR` | "Unexpected response from YouTube's feed server." |
| Stale cache served | Banner: "Showing cached videos from [date] — YouTube could not be reached." |

### Decision 6: `Cache-Control` on successful API responses

Add `Cache-Control: private, max-age=300, stale-while-revalidate=3600` to `/api/channel-feed` success responses. This allows the browser's HTTP cache to serve the raw XML for 5 minutes without a network round-trip, complementing the client-side parsed cache. `private` is used because each response is specific to one user's channel — there is no value in CDN-level sharing, and it avoids unexpected Vercel Edge caching behavior.

## Risks / Trade-offs

- **Stale content**: A channel that published new videos while the user hasn't browsed it recently will show old data during an outage. Acceptable for a personal TV app.
- **localStorage storage pressure**: If the user stores very large feeds repeatedly, the 30-entry cap helps but the cache could still grow. Mitigation: the cap and LRU eviction bound the maximum size.
- **localStorage unavailability**: Private browsing modes or storage errors can make localStorage unavailable. Mitigation: cache read/write wrapped in try/catch; silently degrade to no-cache behavior.
- **Cold-cache first load**: The very first time a channel is opened, there's no cache, so an outage still shows an error. Mitigation: nothing to do — cache must be seeded by at least one successful browse.

## Migration Plan

No migration needed. The cache key is new; no existing data is touched. The change is purely additive until the error message copy changes in `ChannelBrowseModal`, which is non-breaking.
