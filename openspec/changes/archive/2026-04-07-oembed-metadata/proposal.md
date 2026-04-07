## Why

The original implementation requires a YouTube Data API v3 key, which adds friction (obtaining a key, managing env vars, quota limits). YouTube's oEmbed endpoint provides the metadata we actually need for single videos — title, thumbnail, channel name — with no key, no quota, and no configuration.

## What Changes

- **BREAKING** Remove `YOUTUBE_API_KEY` environment variable requirement — no API key needed anywhere
- Replace YouTube Data API v3 calls in `/api/youtube` with YouTube oEmbed for video metadata
- Remove video duration from `VideoItem` (oEmbed does not return duration)
- Remove the "Pick Videos" playlist flow — oEmbed has no playlist items endpoint; without an API key there is no reliable way to enumerate playlist videos
- Playlist add flow simplified to: paste URL → user types a name → stored as channel
- `/api/youtube` route becomes optional or can be removed entirely — oEmbed can be called client-side (CORS-enabled, no key needed)
- Update `VideoItem` type to make `duration` optional or remove it
- Update library cards to omit duration display

## Capabilities

### New Capabilities

### Modified Capabilities

- `youtube-metadata`: Replace API-key-based fetch with oEmbed for videos; playlist metadata now user-supplied (name only); remove playlist items fetch entirely
- `playlist-add-flow`: Remove "Pick Videos" path; playlist add is now name + URL → stored as channel only
- `library-management`: `VideoItem.duration` removed; library cards no longer show duration

## Impact

- `src/lib/youtube.ts` — rewrite or delete
- `src/app/api/youtube/route.ts` — simplify or delete
- `src/types/library.ts` — remove `duration` from `VideoItem`
- `src/components/AddFlow.tsx` — remove Pick Videos branch, add name input for playlists
- `src/components/LibraryPanel.tsx` — remove duration from card display
- `src/components/PlayerArea.tsx` — remove duration from now-playing bar
- `.env.local.example` — delete (no env vars needed)
- `CLAUDE.md` — update to reflect no API key requirement
