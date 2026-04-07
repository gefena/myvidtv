## 1. Remove API Key Infrastructure

- [x] 1.1 Delete `src/app/api/youtube/` directory and route file
- [x] 1.2 Delete `src/lib/youtube.ts`
- [x] 1.3 Delete `.env.local.example`
- [x] 1.4 Update `CLAUDE.md` — remove API key references, document oEmbed approach

## 2. Update Types

- [x] 2.1 Remove `duration` field from `VideoItem` in `src/types/library.ts`
- [x] 2.2 Remove `YouTubeVideoMeta.duration` and `ytTags` fields (oEmbed doesn't return them)
- [x] 2.3 Remove `YouTubePlaylistMeta` and `YouTubePlaylistItemsResponse` types (no longer used)
- [x] 2.4 Add `YouTubeOEmbedResult` type: `{ title, author_name, thumbnail_url }`

## 3. Add oEmbed Utility

- [x] 3.1 Create `src/lib/oembed.ts` with `fetchVideoOEmbed(url: string)` — calls YouTube oEmbed endpoint, returns normalized `{ title, channelName, thumbnail }`
- [x] 3.2 Add `parsePlaylistId(url: string)` utility — extracts playlist ID from a YouTube playlist URL client-side (no network call)

## 4. Rewrite AddFlow

- [x] 4.1 Replace `/api/youtube` fetch with `fetchVideoOEmbed` for video URLs
- [x] 4.2 Remove the `playlist-choice` and `playlist-items` step branches
- [x] 4.3 Add `playlist-name` step: detected playlist URL shows playlist ID + name input field
- [x] 4.4 Save playlist-channel with user-supplied name, parsed playlist ID, no thumbnail
- [x] 4.5 Remove `formatDuration` helper (no longer needed in AddFlow)

## 5. Update Library UI

- [x] 5.1 Remove duration display from `LibraryPanel` item cards — show channel name only
- [x] 5.2 Remove duration display from `PlayerArea` now-playing bar time sub-label

## 6. Verify & Build

- [x] 6.1 Fix any TypeScript errors from removed `duration` field across all components
- [x] 6.2 Run `npm run build` — confirm clean build with no errors
