## Context

The existing implementation uses YouTube Data API v3, requiring a server-side `YOUTUBE_API_KEY`. This change replaces that with YouTube's oEmbed endpoint — a public, CORS-enabled, key-free API that returns the metadata subset we actually need.

Current flow: client → `/api/youtube` (Next.js route) → YouTube Data API v3 (with key)
New flow: client → YouTube oEmbed directly (no server hop needed)

## Goals / Non-Goals

**Goals:**
- Eliminate the API key requirement entirely
- Simplify the metadata fetch to a direct client-side call
- Keep video add flow fully functional (title, thumbnail, channel)
- Keep playlist-as-channel flow functional with user-supplied name

**Non-Goals:**
- Retrieving video duration (not available via oEmbed)
- Enumerating playlist items / Pick Videos flow (no key-free solution)
- Caching or rate-limiting (oEmbed has no documented quota)

## Decisions

### 1. Call oEmbed directly from the client (remove the API route)

oEmbed is CORS-enabled — browsers can call it directly. The `/api/youtube` Next.js route was only needed to hide the API key. With no key, there's nothing to hide, so the route can be deleted entirely.

```
GET https://www.youtube.com/oembed?url=<encoded_url>&format=json
```

Returns: `title`, `author_name` (channel), `thumbnail_url`, `type`, `provider_name`

**Alternative considered**: Keep the API route as a proxy anyway — adds latency and complexity for no benefit. Rejected.

### 2. Remove `duration` from `VideoItem`

oEmbed does not return duration. Rather than showing "0:00" or a placeholder, duration is removed from the type and UI entirely. The player controls (progress bar, time display) still work because the YouTube IFrame API provides `getDuration()` at play time.

**Alternative considered**: Fetch duration separately via a scrape or ytdl — reintroduces complexity. Rejected.

### 3. Playlist metadata is user-supplied

oEmbed does not support playlist URLs. The user pastes a playlist URL and types a name for it. The playlist ID is parsed from the URL client-side. No network call needed.

**Alternative considered**: Show a generic "Playlist" label with the playlist ID — worse UX. Letting the user name it is minimal extra friction and much cleaner.

### 4. Remove Pick Videos flow entirely

Without a key, there is no reliable way to enumerate playlist items. The flow is removed. Users can always add individual video URLs instead.

## Risks / Trade-offs

- **No duration display** → Acceptable. The player still tracks progress. Library cards show channel name instead.
- **oEmbed availability** → YouTube's oEmbed endpoint has been stable for 15+ years. Risk is very low.
- **Playlist name is user-typed** → Minor UX friction. Users know what they're adding.
- **oEmbed rate limits** → Undocumented. In practice, a single user adding a few links will never approach any limit.

## Migration Plan

1. Delete `src/app/api/youtube/` route directory
2. Delete `src/lib/youtube.ts`
3. Delete `.env.local.example`
4. Update `VideoItem` type — remove `duration`
5. Add `fetchVideoOEmbed(url)` client-side utility in `src/lib/oembed.ts`
6. Rewrite `AddFlow` to use oEmbed for videos; replace playlist flow with name input
7. Remove duration display from `LibraryPanel`, `PlayerArea`
8. Update `CLAUDE.md`
